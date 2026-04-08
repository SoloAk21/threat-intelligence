// src/services/threat.service.js
const axios = require("axios");
const validator = require("validator");
const dns = require("dns").promises;
const crypto = require("crypto");
const {
  VT_BASE,
  OTX_BASE,
  THREATFOX_BASE,
  PULSEDIVE_BASE,
  URLSCAN_BASE,
  URLHAUS_BASE,
  SUCURI_BASE,
} = require("../config/constants");

// ====================== HELPER FUNCTIONS ======================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safeGet = (obj, path, defaultValue = null) => {
  return (
    path.split(".").reduce((acc, part) => acc?.[part], obj) ?? defaultValue
  );
};

// ====================== 1. ABUSEIPDB ======================
async function checkAbuseIPDB(ip) {
  if (!validator.isIP(ip))
    return { error: "Invalid IP", abuseConfidenceScore: 0 };

  try {
    const response = await axios.get("https://api.abuseipdb.com/api/v2/check", {
      params: { ipAddress: ip, maxAgeInDays: 90, verbose: true },
      headers: {
        Key: process.env.ABUSEIPDB_API_KEY,
        Accept: "application/json",
      },
      timeout: 10000,
    });

    const d = response.data.data;

    return {
      abuseConfidenceScore: d.abuseConfidenceScore || 0,
      totalReports: d.totalReports || 0,
      countryCode: d.countryCode,
      countryName: d.countryName,
      usageType: d.usageType,
      isp: d.isp,
      domain: d.domain,
      isWhitelisted: d.isWhitelisted || false,
      isTor: d.isTor || false,
      numDistinctUsers: d.numDistinctUsers,
      lastReportedAt: d.lastReportedAt,
      ipAddress: d.ipAddress,
      isPublic: d.isPublic,
      ipVersion: d.ipVersion,
      hostnames: d.hostnames || [],
      reports: d.reports || [],
      raw: d,
    };
  } catch (err) {
    console.error("AbuseIPDB error:", err.message);
    return {
      error: err.message,
      abuseConfidenceScore: 0,
      totalReports: 0,
      note: "AbuseIPDB lookup failed",
    };
  }
}

// ====================== 2. VIRUSTOTAL ======================
async function getVTReport(type, id) {
  try {
    let endpoint,
      finalId = id;

    switch (type) {
      case "ip":
        endpoint = "ip_addresses";
        break;
      case "domain":
        endpoint = "domains";
        break;
      case "url":
        // URLs need base64 encoding without padding
        finalId = Buffer.from(id).toString("base64").replace(/=+$/, "");
        const urlRes = await axios.get(`${VT_BASE}/urls/${finalId}`, {
          headers: { "x-apikey": process.env.VT_API_KEY },
          timeout: 12000,
        });
        return urlRes.data.data.attributes;
      case "file":
        const fileRes = await axios.get(`${VT_BASE}/files/${id}`, {
          headers: { "x-apikey": process.env.VT_API_KEY },
          timeout: 12000,
        });
        return fileRes.data.data.attributes;
      default:
        return { error: `Unsupported type: ${type}` };
    }

    const res = await axios.get(`${VT_BASE}/${endpoint}/${finalId}`, {
      headers: { "x-apikey": process.env.VT_API_KEY },
      timeout: 12000,
    });

    const data = res.data.data;
    const attrs = data.attributes;

    return {
      ...attrs,
      id: data.id,
      type: data.type,
      input: id,
    };
  } catch (err) {
    console.error(`VirusTotal ${type} error:`, err.message);

    // Handle rate limit specifically
    if (err.response?.status === 429) {
      return {
        error: "VirusTotal rate limit exceeded",
        last_analysis_stats: {
          malicious: 0,
          suspicious: 0,
          undetected: 0,
          harmless: 0,
        },
        note: "Rate limited - try again later",
      };
    }

    return {
      error: err.message,
      last_analysis_stats: {
        malicious: 0,
        suspicious: 0,
        undetected: 0,
        harmless: 0,
      },
    };
  }
}

// ====================== 3. ALIENVAULT OTX ======================
async function checkAlienVaultOTX(type, value) {
  let endpoint = "";

  switch (type) {
    case "ip":
      endpoint = `indicator/IPv4/${value}`;
      break;
    case "domain":
      endpoint = `indicator/domain/${value}`;
      break;
    case "url":
      endpoint = `indicator/url/${encodeURIComponent(value)}`;
      break;
    case "file":
      endpoint = `indicator/file/${value}`;
      break;
    default:
      return { error: "Unsupported type", pulse_count: 0, is_malicious: false };
  }

  try {
    const headers = process.env.OTX_API_KEY
      ? { "X-OTX-API-KEY": process.env.OTX_API_KEY }
      : {};

    const res = await axios.get(`${OTX_BASE}/${endpoint}`, {
      headers,
      timeout: 10000,
    });

    const data = res.data;
    const pulseCount = data.pulse_info?.count || 0;
    const pulses = data.pulse_info?.pulses || [];

    // Extract malware families and attack IDs
    const malwareFamilies = [];
    const attackIds = [];

    pulses.forEach((pulse) => {
      if (pulse.malware_families) {
        pulse.malware_families.forEach((m) =>
          malwareFamilies.push(m.display_name || m),
        );
      }
      if (pulse.attack_ids) {
        pulse.attack_ids.forEach((a) => attackIds.push(a.display_name || a));
      }
    });

    return {
      indicator: value,
      type,
      pulse_count: pulseCount,
      is_malicious:
        pulseCount > 3 || !!data.malware || data.validation?.length > 0,
      tags: data.tags || [],
      pulses: pulses.slice(0, 10),
      malware_families: [...new Set(malwareFamilies)],
      attack_ids: [...new Set(attackIds)],
      raw: data,
    };
  } catch (err) {
    console.error("OTX error:", err.message);
    return {
      error: err.message,
      pulse_count: 0,
      is_malicious: false,
      note: "OTX lookup failed",
    };
  }
}

// ====================== 4. THREATFOX ======================
async function checkThreatFox(ioc) {
  try {
    const payload = {
      query: "search_ioc",
      search_term: ioc,
      exact_match: false,
    };

    const res = await axios.post(THREATFOX_BASE, payload, {
      headers: {
        "Auth-Key": process.env.THREATFOX_AUTH_KEY || "",
        "Content-Type": "application/json",
      },
      timeout: 12000,
    });

    const data = res.data;

    if (data.query_status === "no_result" || !data.data?.length) {
      return {
        ioc,
        ioc_count: 0,
        is_malicious: false,
        raw: data,
        note: "No results found",
      };
    }

    const threats = data.data;
    const tags = [...new Set(threats.flatMap((r) => r.tags || []))];
    const malwareTypes = [
      ...new Set(threats.map((r) => r.threat_type).filter(Boolean)),
    ];

    return {
      ioc,
      ioc_count: threats.length,
      is_malicious: threats.length > 0,
      threat_type: threats[0]?.threat_type || null,
      malware: threats[0]?.malware_printable || threats[0]?.malware || null,
      confidence_level: threats[0]?.confidence_level || 0,
      tags,
      malware_types: malwareTypes,
      threats: threats.slice(0, 5),
      raw: data,
    };
  } catch (err) {
    console.error("ThreatFox error:", err.message);
    return {
      error: err.message,
      ioc_count: 0,
      is_malicious: false,
      note: "ThreatFox lookup failed",
    };
  }
}

// ====================== 5. PULSEDIVE ======================
async function checkPulsedive(ioc) {
  if (!ioc) return { risk: "none", is_malicious: false, note: "No indicator" };

  try {
    const res = await axios.get("https://pulsedive.com/api/info.php", {
      params: {
        indicator: ioc,
        pretty: 1,
        key: process.env.PULSEDIVE_API_KEY,
        probe: 1,
      },
      timeout: 15000,
    });

    const d = res.data;
    const risk = (d.risk || "none").toLowerCase();

    return {
      risk,
      score: d.score || 0,
      is_malicious: ["high", "critical", "medium"].includes(risk),
      threats: d.threats || [],
      feeds: d.feeds || [],
      attributes: d.attributes || {},
      properties: d.properties || {},
      stamp_added: d.stamp_added,
      stamp_updated: d.stamp_updated,
      stamp_seen: d.stamp_seen,
      riskfactors: d.riskfactors || [],
      raw: d,
    };
  } catch (err) {
    console.error("Pulsedive error:", err.response?.status || err.message);
    return {
      error: err.response?.status === 404 ? "Indicator not found" : err.message,
      risk: "none",
      is_malicious: false,
      score: 0,
      note: "Pulsedive lookup failed",
    };
  }
}

// ====================== 6. GREYNOISE ======================
async function checkGreyNoise(ip) {
  if (!validator.isIP(ip))
    return { error: "Invalid IP", classification: "unknown" };

  try {
    // Try community API first (free)
    const res = await axios.get(`https://api.greynoise.io/v3/community/${ip}`, {
      timeout: 10000,
    });

    const d = res.data;

    return {
      classification: d.classification || "unknown",
      noise: d.noise || false,
      riot: d.riot || false,
      name: d.name || null,
      link: d.link || null,
      last_seen: d.last_seen || null,
      message: d.message || null,
      raw: d,
    };
  } catch (err) {
    console.error("GreyNoise error:", err.message);
    return {
      classification: "unknown",
      noise: false,
      note: "GreyNoise lookup failed",
    };
  }
}

// ====================== 7. IPQUALITYSCORE ======================
async function checkIPQualityScore(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP", fraud_score: 0 };

  try {
    const key = process.env.IPQUALITYSCORE_API_KEY || process.env.IPQS_API_KEY;

    if (!key) {
      return { note: "IPQualityScore API key missing", fraud_score: 0 };
    }

    const res = await axios.get(
      `https://www.ipqualityscore.com/api/json/ip/${key}/${ip}`,
      {
        params: {
          strictness: 1,
          allow_public_access_points: true,
          fast: false,
        },
        timeout: 10000,
      },
    );

    const d = res.data;

    return {
      fraud_score: d.fraud_score || 0,
      vpn: d.vpn || false,
      proxy: d.proxy || false,
      tor: d.tor || false,
      recent_abuse: d.recent_abuse || false,
      bot_status: d.bot_status || false,
      is_crawler: d.is_crawler || false,
      mobile: d.mobile || false,
      active: d.active || false,
      country_code: d.country_code,
      city: d.city,
      region: d.region,
      isp: d.ISP,
      organization: d.organization,
      hostname: d.host,
      asn: d.ASN,
      raw: d,
    };
  } catch (err) {
    console.error("IPQualityScore error:", err.message);
    return {
      error: err.message,
      fraud_score: 0,
      note: "IPQualityScore lookup failed",
    };
  }
}

// ====================== 8. VPNAPI.IO ======================
async function checkVPNAPI(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };

  try {
    const key = process.env.VPNAPI_KEY;
    const url = key
      ? `https://vpnapi.io/api/${ip}?key=${key}`
      : `https://vpnapi.io/api/${ip}`;

    const res = await axios.get(url, { timeout: 10000 });
    return res.data;
  } catch (err) {
    console.error("VPNAPI error:", err.message);
    return {
      error: err.message,
      security: { vpn: false, proxy: false, tor: false, relay: false },
      note: "VPNAPI lookup failed",
    };
  }
}

// ====================== 9. SHODAN INTERNETDB ======================
async function checkShodanInternetDB(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP", ports: [], cves: [] };

  try {
    const res = await axios.get(`https://internetdb.shodan.io/${ip}`, {
      timeout: 10000,
    });

    const d = res.data;

    return {
      ports: d.ports || [],
      cves: d.cves || [],
      hostnames: d.hostnames || [],
      tags: d.tags || [],
      vulns: d.vulns || [],
      raw: d,
    };
  } catch (err) {
    return {
      note: "Shodan InternetDB unavailable",
      ports: [],
      cves: [],
      error: err.message,
    };
  }
}

// ====================== 10. CENSYS ======================
async function checkCensys(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP", services: [] };

  const token = process.env.CENSYS_API_TOKEN;
  const apiId = process.env.CENSYS_API_ID;

  if (!token || !apiId) {
    return { note: "Censys credentials missing", services: [] };
  }

  try {
    const auth = Buffer.from(`${apiId}:${token}`).toString("base64");

    const res = await axios.get(`https://search.censys.io/api/v2/hosts/${ip}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
      timeout: 12000,
    });

    const data = res.data.result;

    const services = (data?.services || []).map((s) => ({
      port: s.port,
      service_name: s.service_name || "unknown",
      transport: s.transport_protocol,
      banner: s.banner?.slice(0, 200),
    }));

    return {
      services,
      location: data?.location,
      autonomous_system: data?.autonomous_system,
      last_updated: data?.last_updated_at,
      raw: data,
    };
  } catch (err) {
    console.error("Censys error:", err.message);

    if (err.response?.status === 401) {
      return { error: "Invalid Censys credentials", services: [] };
    }
    if (err.response?.status === 429) {
      return { error: "Censys rate limit hit", services: [] };
    }

    return { note: "Censys lookup failed", services: [] };
  }
}

// ====================== 11. IPINFO ======================
async function checkIPinfo(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };

  try {
    const token = process.env.IPINFO_TOKEN;
    const url = token
      ? `https://ipinfo.io/${ip}/json?token=${token}`
      : `https://ipinfo.io/${ip}/json`;

    const res = await axios.get(url, { timeout: 8000 });
    const data = res.data;

    let latitude = null,
      longitude = null;
    if (data.loc) {
      const coords = data.loc.split(",");
      latitude = parseFloat(coords[0]);
      longitude = parseFloat(coords[1]);
    }

    let asn = null,
      orgName = data.org;
    if (data.org && data.org.includes(" ")) {
      const parts = data.org.split(" ");
      asn = parts[0];
      orgName = parts.slice(1).join(" ");
    }

    // Try to get enriched data
    let enrichedData = {};
    try {
      const coreUrl = token
        ? `https://ipinfo.io/${ip}?token=${token}`
        : `https://ipinfo.io/${ip}`;
      const coreRes = await axios.get(coreUrl, { timeout: 8000 });
      enrichedData = coreRes.data;
    } catch (err) {
      // Fallback to basic data
    }

    return {
      ip: data.ip,
      hostname: data.hostname || null,
      city: data.city || null,
      region: data.region || null,
      country: data.country || null,
      loc: data.loc || null,
      org: data.org || null,
      postal: data.postal || null,
      timezone: data.timezone || null,
      latitude,
      longitude,
      asn,
      org_name: orgName,
      privacy: enrichedData.privacy || {},
      abuse: enrichedData.abuse || {},
      domains: enrichedData.domains || {},
      company: enrichedData.company || {},
      carrier: enrichedData.carrier || {},
      raw: data,
      enriched: enrichedData,
    };
  } catch (err) {
    console.error("IPinfo error:", err.message);
    return {
      note: "IPinfo lookup failed",
      ip,
      error: err.message,
    };
  }
}

// ====================== 12. CISCO TALOS ======================
async function checkTalos(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP", blacklisted: false };

  try {
    const res = await axios.get(
      `https://talosintelligence.com/reputation_center/lookup?search=${ip}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        timeout: 10000,
      },
    );

    const html = res.data.toLowerCase();

    // Check for indicators of malicious reputation
    const blacklisted =
      /poor|malicious|high risk|blacklisted|spam|botnet/i.test(html);
    const emailReputation =
      html.match(/email reputation[^>]*>([^<]+)</i)?.[1] || "unknown";

    return {
      reputation: blacklisted ? "Poor / Malicious" : "Neutral / Good",
      blacklisted,
      email_reputation: emailReputation,
      note: "Talos Reputation Center",
      raw: null,
    };
  } catch (err) {
    return {
      note: "Talos lookup failed (possible CAPTCHA)",
      blacklisted: false,
      error: err.message,
    };
  }
}

// ====================== 13. MULTI-RBL ======================
async function checkMultiRBL(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP", listedCount: 0 };

  const rbls = [
    { name: "zen.spamhaus.org", weight: 3 },
    { name: "bl.spamcop.net", weight: 2 },
    { name: "b.barracudacentral.org", weight: 2 },
    { name: "dnsbl.sorbs.net", weight: 2 },
    { name: "psbl.surriel.com", weight: 2 },
    { name: "ix.dnsbl.manitu.net", weight: 1 },
    { name: "dnsbl-1.uceprotect.net", weight: 1 },
  ];

  let listedCount = 0;
  let weightedScore = 0;
  const lists = [];

  for (const rbl of rbls) {
    try {
      const reversed = ip.split(".").reverse().join(".");
      await dns.resolve4(`${reversed}.${rbl.name}`);
      listedCount++;
      weightedScore += rbl.weight;
      lists.push({ name: rbl.name, listed: true, weight: rbl.weight });
    } catch {
      lists.push({ name: rbl.name, listed: false, weight: rbl.weight });
    }
  }

  return {
    listedCount,
    totalChecked: rbls.length,
    is_blacklisted: listedCount >= 2,
    weighted_score: weightedScore,
    lists,
    note: "Multi-RBL DNS Check",
  };
}

// ====================== 14. INQUEST LABS ======================
async function checkInQuest(query) {
  try {
    const res = await axios.get("https://labs.inquest.net/api/repdb/search", {
      params: { keyword: query },
      timeout: 10000,
    });

    const data = res.data?.data || [];

    // Group by source
    const sources = data.reduce((acc, item) => {
      const source = item.source || "unknown";
      if (!acc[source]) acc[source] = [];
      acc[source].push(item);
      return acc;
    }, {});

    return {
      reputation_hits: data.length,
      is_malicious: data.length >= 3,
      sources: Object.entries(sources).map(([name, items]) => ({
        source: name,
        count: items.length,
        data: items[0]?.data,
        derived: items[0]?.derived,
        date: items[0]?.created_date,
      })),
      note: "InQuest Labs RepDB",
      raw: data,
    };
  } catch (err) {
    console.error("InQuest Labs error:", err.message);
    return {
      note: "InQuest Labs lookup failed",
      reputation_hits: 0,
      is_malicious: false,
      raw: null,
    };
  }
}

// ====================== 15. THREATMINER ======================
async function checkThreatMiner(query) {
  try {
    const res = await axios.get("https://api.threatminer.org/v2/host.php", {
      params: { q: query, rt: 1 },
      timeout: 10000,
    });

    const data = res.data;

    return {
      status: data.status_code,
      status_message: data.status_message,
      detections: data.results?.length || 0,
      results: (data.results || []).slice(0, 10),
      raw: data,
    };
  } catch (err) {
    return {
      note: "ThreatMiner lookup failed",
      detections: 0,
      error: err.message,
    };
  }
}

// ====================== 16. IP TEOH ======================
async function checkIPTeoh(ip) {
  // Reuse VPNAPI as it provides similar data
  return checkVPNAPI(ip);
}

// ====================== 17. MALWAREURL ======================
async function checkMalwareURL(query) {
  try {
    const res = await axios.get(
      `https://www.malwareurl.com/ns_listing.php?ip=${encodeURIComponent(query)}`,
      { timeout: 8000 },
    );

    const html = res.data.toLowerCase();
    const isMalicious = /malware|listed|blacklisted|spam|botnet|phishing/i.test(
      html,
    );

    // Extract listing info if available
    const listedMatch = html.match(/listed in (\d+) blacklists?/i);
    const blacklistCount = listedMatch ? parseInt(listedMatch[1]) : 0;

    return {
      is_malicious: isMalicious,
      blacklist_count: blacklistCount,
      note: "MalwareURL basic check",
      raw: null,
    };
  } catch (err) {
    return {
      is_malicious: false,
      note: "MalwareURL check unavailable",
      error: err.message,
    };
  }
}

// ====================== 18. IOC.ONE ======================
async function checkIOCOne(query) {
  try {
    const res = await axios.get(
      `https://ioc.one/api/search?q=${encodeURIComponent(query)}`,
      { timeout: 8000 },
    );

    const data = res.data;

    return {
      hits: data?.hits || 0,
      is_malicious: (data?.hits || 0) > 0,
      results: (data?.results || []).slice(0, 5),
      raw: data,
    };
  } catch (err) {
    return {
      note: "IOC.one lookup limited/unavailable",
      hits: 0,
      is_malicious: false,
      error: err.message,
    };
  }
}

// ====================== 19. IPIFY ======================
async function checkIPify(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };

  try {
    const apiKey = process.env.IPIFY_API_KEY;

    if (!apiKey) {
      return { note: "IPify API key missing" };
    }

    const res = await axios.get(
      `https://geo.ipify.org/api/v2/country,city,vpn?apiKey=${apiKey}&ipAddress=${ip}`,
      { timeout: 10000 },
    );

    const data = res.data;

    return {
      ip: data.ip,
      location: {
        country: data.location?.country,
        region: data.location?.region,
        city: data.location?.city,
        lat: data.location?.lat,
        lng: data.location?.lng,
        postalCode: data.location?.postalCode,
        timezone: data.location?.timezone,
      },
      as: {
        asn: data.as?.asn,
        name: data.as?.name,
        route: data.as?.route,
        domain: data.as?.domain,
      },
      isp: data.isp,
      proxy: {
        proxy: data.proxy?.proxy || false,
        vpn: data.proxy?.vpn || false,
        tor: data.proxy?.tor || false,
      },
    };
  } catch (err) {
    console.error("IPify error:", err.message);
    return {
      error: err.message,
      note: "IPify lookup failed",
    };
  }
}

// ====================== 20. URLSCAN.IO ======================
async function checkURLScan(url) {
  const apiKey =
    process.env.URLSCAN_API_KEY || "019d69db-7852-76d2-913e-dc1229efc0ad";

  try {
    // Submit URL for scanning
    const submitRes = await axios.post(
      `${URLSCAN_BASE}/scan/`,
      {
        url,
        visibility: "public",
        tags: ["threat-intel", "automated-scan"],
      },
      {
        headers: {
          "API-Key": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    const { uuid, api, result } = submitRes.data;

    // Wait for processing (max 10 seconds)
    let resultData = null;
    let attempts = 0;

    while (attempts < 5 && !resultData) {
      await delay(2000);

      try {
        const resultRes = await axios.get(`${URLSCAN_BASE}/result/${uuid}/`, {
          headers: { "API-Key": apiKey },
          timeout: 10000,
        });
        resultData = resultRes.data;
      } catch (e) {
        // Still processing
      }
      attempts++;
    }

    if (!resultData) {
      return {
        uuid,
        url,
        is_malicious: false,
        status: "pending",
        report_url: result || api,
        note: "Scan submitted, results pending",
      };
    }

    const verdicts = resultData.verdicts || {};
    const isMalicious = verdicts.overall?.malicious || false;
    const score = verdicts.overall?.score || 0;

    return {
      uuid,
      url,
      is_malicious: isMalicious,
      score,
      verdicts,
      page: {
        domain: resultData.page?.domain,
        ip: resultData.page?.ip,
        country: resultData.page?.country,
        server: resultData.page?.server,
        asn: resultData.page?.asn,
      },
      stats: resultData.stats || {},
      lists: resultData.lists || {},
      report_url: result || api,
      screenshot: resultData.task?.screenshotURL,
      raw: resultData,
    };
  } catch (err) {
    console.error("URLScan error:", err.message);
    return {
      error: err.message,
      is_malicious: false,
      note: "URLScan lookup failed",
    };
  }
}

// ====================== 21. URLHAUS ======================
async function checkURLHaus(query) {
  try {
    const isURL = query.startsWith("http") || query.includes(".");

    const payload = isURL
      ? { query: "search_url", url: query }
      : { query: "search_hash", hash: query };

    const res = await axios.post(`${URLHAUS_BASE}/query/`, payload, {
      timeout: 12000,
    });

    const data = res.data;

    if (data.query_status === "no_results") {
      return {
        is_malicious: false,
        count: 0,
        urls: [],
        note: "No results found",
      };
    }

    if (data.query_status !== "ok") {
      return {
        error: data.query_status,
        is_malicious: false,
        count: 0,
      };
    }

    const results = data.urls || data.hashes || [];
    const isMalicious = results.length > 0;

    // Extract tags and threat types
    const tags = [...new Set(results.flatMap((r) => r.tags || []))];
    const threatTypes = [
      ...new Set(results.map((r) => r.threat).filter(Boolean)),
    ];

    return {
      is_malicious: isMalicious,
      count: results.length,
      threat_types: threatTypes,
      tags,
      urls: results.slice(0, 10).map((r) => ({
        id: r.id,
        url: r.url,
        urlhaus_reference: r.urlhaus_reference,
        threat: r.threat,
        tags: r.tags || [],
        date_added: r.date_added,
        reporter: r.reporter,
        larted: r.larted,
      })),
      raw: data,
    };
  } catch (err) {
    console.error("URLHaus error:", err.message);
    return {
      error: err.message,
      is_malicious: false,
      count: 0,
      note: "URLHaus lookup failed",
    };
  }
}

// ====================== 22. SUCURI SITECHECK ======================
async function checkSucuri(domain) {
  const apiKey =
    process.env.SUCURI_API_KEY || "6b9c8e5f-1a2b-4c3d-9e4f-5g6h7i8j9k0l";

  try {
    const res = await axios.post(
      `${SUCURI_BASE}/scan`,
      { url: domain },
      {
        headers: {
          "X-Auth-Key": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 25000,
      },
    );

    const data = res.data;

    return {
      status: data.status || "unknown",
      is_malicious: data.malicious || data.blacklisted || false,
      blacklist: {
        malware: data.blacklist?.malware || false,
        phishing: data.blacklist?.phishing || false,
        spam: data.blacklist?.spam || false,
        defacement: data.blacklist?.defacement || false,
      },
      recommendations: data.recommendations || [],
      malware: (data.malware || []).slice(0, 10),
      blacklisted_by: data.blacklisted_by || [],
      scan_id: data.scan_id,
      scanned_at: data.scanned_at,
      raw: data,
    };
  } catch (err) {
    console.error("Sucuri error:", err.message);
    return {
      error: err.message,
      is_malicious: false,
      status: "error",
      note: "Sucuri lookup failed",
    };
  }
}

// ====================== 23. VIRUSTOTAL FILE REPORT ======================
async function getVTFileReport(hash) {
  return getVTReport("file", hash);
}

// ====================== 24. VIRUSTOTAL URL REPORT ======================
async function getVTURLReport(url) {
  return getVTReport("url", url);
}

// ====================== 25. VIRUSTOTAL DOMAIN REPORT ======================
async function getVTDomainReport(domain) {
  return getVTReport("domain", domain);
}

// ====================== BATCH ANALYSIS ======================
async function batchAnalyze(indicators) {
  const results = [];

  for (const indicator of indicators) {
    const type = indicator.type || "ip";
    let result;

    switch (type) {
      case "ip":
        result = {
          indicator: indicator.value,
          vt: await getVTReport("ip", indicator.value),
          abuseipdb: await checkAbuseIPDB(indicator.value),
          otx: await checkAlienVaultOTX("ip", indicator.value),
        };
        break;
      case "url":
        result = {
          indicator: indicator.value,
          vt: await getVTURLReport(indicator.value),
          urlscan: await checkURLScan(indicator.value),
          urlhaus: await checkURLHaus(indicator.value),
        };
        break;
      case "domain":
        result = {
          indicator: indicator.value,
          vt: await getVTDomainReport(indicator.value),
          sucuri: await checkSucuri(indicator.value),
        };
        break;
      default:
        result = { indicator: indicator.value, error: "Unsupported type" };
    }

    results.push(result);
    await delay(500); // Rate limit protection
  }

  return results;
}

// ====================== EXPORT ALL ======================
module.exports = {
  // Core IP Services
  checkAbuseIPDB,
  getVTReport,
  checkAlienVaultOTX,
  checkThreatFox,
  checkPulsedive,
  checkGreyNoise,
  checkIPQualityScore,
  checkVPNAPI,
  checkShodanInternetDB,
  checkCensys,
  checkIPinfo,
  checkTalos,
  checkInQuest,
  checkThreatMiner,
  checkMultiRBL,
  checkIPTeoh,
  checkMalwareURL,
  checkIOCOne,
  checkIPify,

  // URL/Domain Services
  checkURLScan,
  checkURLHaus,
  checkSucuri,

  // VirusTotal Specialized
  getVTFileReport,
  getVTURLReport,
  getVTDomainReport,

  // Batch Operations
  batchAnalyze,
};
