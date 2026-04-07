// src/services/threat.service.js
const axios = require("axios");
const validator = require("validator");
const dns = require("dns").promises;
const { VT_BASE, OTX_BASE, THREATFOX_BASE } = require("../config/constants");

// ====================== ALL 19 THREAT INTELLIGENCE SOURCES ======================

// 1. AbuseIPDB
async function checkAbuseIPDB(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };
  try {
    const response = await axios.get("https://api.abuseipdb.com/api/v2/check", {
      params: { ipAddress: ip, maxAgeInDays: 90 },
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
      country: d.countryCode,
      usageType: d.usageType,
      isWhitelisted: d.isWhitelisted || false,
      raw: d,
    };
  } catch (err) {
    console.error("AbuseIPDB error:", err.message);
    return { error: err.message, abuseConfidenceScore: 0 };
  }
}

// 2. VirusTotal
async function getVTReport(type, id) {
  try {
    const endpoint = type === "ip" ? "ip_addresses" : "files";
    const res = await axios.get(`${VT_BASE}/${endpoint}/${id}`, {
      headers: { "x-apikey": process.env.VT_API_KEY },
      timeout: 12000,
    });
    return res.data.data.attributes;
  } catch (err) {
    console.error("VirusTotal error:", err.message);
    return { error: err.message };
  }
}

// 3. AlienVault OTX
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
      return { error: "Unsupported type" };
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
    return {
      indicator: value,
      type,
      pulse_count: pulseCount,
      is_malicious: pulseCount > 3 || !!data.malware,
      tags: data.tags || [],
      raw: data,
    };
  } catch (err) {
    console.error("OTX error:", err.message);
    return { error: err.message, pulse_count: 0, is_malicious: false };
  }
}

// 4. ThreatFox
async function checkThreatFox(ioc) {
  try {
    const payload = {
      query: "search_ioc",
      search_term: ioc,
      exact_match: true,
    };
    const res = await axios.post(THREATFOX_BASE, payload, {
      headers: {
        "Auth-Key": process.env.THREATFOX_AUTH_KEY || "",
        "Content-Type": "application/json",
      },
      timeout: 12000,
    });
    const data = res.data;
    if (data.query_status !== "ok" || !data.data?.length) {
      return { ioc, ioc_count: 0, is_malicious: false, raw: data };
    }
    const first = data.data[0];
    return {
      ioc,
      ioc_count: data.data.length,
      is_malicious: true,
      threat_type: first.threat_type || null,
      malware: first.malware_printable || first.malware || null,
      tags: data.data.flatMap((r) => r.tags || []),
      raw: data.data,
    };
  } catch (err) {
    console.error("ThreatFox error:", err.message);
    return { error: err.message, ioc_count: 0, is_malicious: false };
  }
}

// 5. Pulsedive
async function checkPulsedive(ioc) {
  if (!ioc) return { risk: "none", is_malicious: false, note: "No indicator" };
  try {
    const res = await axios.get("https://pulsedive.com/api/info.php", {
      params: {
        indicator: ioc,
        pretty: 1,
        key: process.env.PULSEDIVE_API_KEY,
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
      properties: d.properties || {},
      raw: d,
    };
  } catch (err) {
    console.error("Pulsedive error:", err.response?.status || err.message);
    return {
      error:
        err.response?.status === 404
          ? "Indicator not found or invalid"
          : err.message,
      risk: "none",
      is_malicious: false,
      note: "Pulsedive lookup failed",
    };
  }
}

// 6. GreyNoise
async function checkGreyNoise(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };
  try {
    const res = await axios.get(`https://api.greynoise.io/v3/community/${ip}`, {
      timeout: 10000,
    });
    const d = res.data;
    return {
      classification: d.classification || "unknown",
      noise: d.noise || false,
      vpn: d.vpn || false,
      vpn_service: d.vpn_service || null,
      tor: d.tor || false,
      bot: d.bot || false,
      raw: d,
    };
  } catch (err) {
    console.error("GreyNoise error:", err.message);
    return { classification: "unknown", noise: false, vpn: false };
  }
}

// 7. IPQualityScore
async function checkIPQualityScore(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };
  try {
    const key = process.env.IPQUALITYSCORE_API_KEY || process.env.IPQS_API_KEY;
    const res = await axios.get(
      `https://www.ipqualityscore.com/api/json/ip/${key}/${ip}`,
      { timeout: 10000 },
    );
    const d = res.data;
    return {
      fraud_score: d.fraud_score || 0,
      vpn: d.vpn || false,
      proxy: d.proxy || false,
      tor: d.tor || false,
      recent_abuse: d.recent_abuse || false,
      raw: d,
    };
  } catch (err) {
    return { note: "IPQualityScore failed", raw: null };
  }
}

// 8. VPNAPI.io
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
    return { note: "VPNAPI.io failed", raw: null };
  }
}

// 9. Shodan InternetDB (Free)
async function checkShodanInternetDB(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };
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
      raw: d,
    };
  } catch (err) {
    return { note: "Shodan InternetDB unavailable", ports: [], cves: [] };
  }
}

// 10. Censys
async function checkCensys(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };

  const token = process.env.CENSYS_API_TOKEN;
  if (!token) return { note: "Censys token missing", services: [] };

  try {
    const res = await axios.get(
      `https://api.platform.censys.io/v3/global/asset/host/${ip}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.censys.api.v3.host.v1+json",
        },
        timeout: 12000,
      },
    );

    const services =
      res.data?.result?.services?.map((s) => ({
        port: s.port,
        service_name: s.service_name || "unknown",
      })) || [];

    return {
      services,
      raw: res.data,
    };
  } catch (err) {
    if (err.response?.status === 401) {
      return { error: "Invalid Censys token", services: [] };
    }
    if (err.response?.status === 429) {
      return { error: "Censys rate limit hit", services: [] };
    }

    return { note: "Censys lookup failed", services: [] };
  }
}

// 11. IPinfo
async function checkIPinfo(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };
  try {
    const token = process.env.IPINFO_TOKEN;

    const url = token
      ? `https://ipinfo.io/${ip}/json?token=${token}`
      : `https://ipinfo.io/${ip}/json`;

    const res = await axios.get(url, { timeout: 8000 });
    const data = res.data;

    let latitude = null;
    let longitude = null;
    if (data.loc) {
      const coords = data.loc.split(",");
      latitude = parseFloat(coords[0]);
      longitude = parseFloat(coords[1]);
    }

    let asn = null;
    let orgName = data.org;
    if (data.org && data.org.includes(" ")) {
      const parts = data.org.split(" ");
      asn = parts[0];
      orgName = parts.slice(1).join(" ");
    }

    let enrichedData = {};
    try {
      const coreUrl = token
        ? `https://ipinfo.io/${ip}?token=${token}`
        : `https://ipinfo.io/${ip}`;
      const coreRes = await axios.get(coreUrl, { timeout: 8000 });
      enrichedData = coreRes.data;
    } catch (err) {
      console.log("Core tier enrichment failed, using basic data");
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
      latitude: latitude,
      longitude: longitude,
      asn: asn,
      org_name: orgName,
      geo: {
        city: data.city,
        region: data.region,
        region_code: enrichedData.region_code,
        country: data.country,
        country_code: data.country,
        continent: enrichedData.continent,
        continent_code: enrichedData.continent_code,
        latitude: latitude,
        longitude: longitude,
        timezone: data.timezone,
        postal_code: data.postal,
      },
      as: {
        asn: asn,
        name: orgName,
        domain: enrichedData.domain || null,
        type: enrichedData.type || null,
        route: enrichedData.route || null,
      },
      is_anonymous:
        enrichedData.privacy?.vpn || enrichedData.privacy?.proxy || false,
      is_anycast: enrichedData.anycast || false,
      is_hosting:
        enrichedData.hosting || enrichedData.privacy?.hosting || false,
      is_mobile: enrichedData.mobile || false,
      is_satellite: enrichedData.satellite || false,
      abuse: enrichedData.abuse,
      domains: enrichedData.domains,
      rate_limit: {
        tier: "Core",
        requests_per_month: 16,
        used: 1,
        remaining: 15,
      },
      raw: data,
      enriched: enrichedData,
    };
  } catch (err) {
    console.error("IPinfo error:", err.message);
    return {
      note: "IPinfo lookup failed",
      ip: ip,
      error: err.message,
      rate_limit: {
        tier: "Lite",
        requests_per_month: 7,
        used: 0,
        remaining: 7,
      },
    };
  }
}

// 12. Cisco Talos (Web scraping)
async function checkTalos(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };
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
    const blacklisted = /poor|malicious|high risk|blacklisted/.test(html);
    const reputation = blacklisted ? "Poor / Malicious" : "Neutral / Good";
    return {
      reputation,
      blacklisted,
      note: "Talos Reputation Center (unofficial scrape)",
      raw: null,
    };
  } catch (err) {
    return {
      note: "Talos lookup failed (possible CAPTCHA or rate limit)",
      blacklisted: false,
    };
  }
}

// 13. InQuest Labs RepDB
async function checkInQuest(ip) {
  if (!validator.isIP(ip)) {
    return { error: "Invalid IP" };
  }

  try {
    const res = await axios.get("https://labs.inquest.net/api/repdb/search", {
      params: { keyword: ip },
      timeout: 10000,
    });

    const data = res.data?.data || [];

    return {
      reputation_hits: data.length,
      is_malicious: data.length >= 3,
      sources: data.map((item) => ({
        source: item.source || "unknown",
        data: item.data,
        derived: item.derived || null,
        date: item.created_date || null,
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

// 14. ThreatMiner
async function checkThreatMiner(query) {
  try {
    const res = await axios.get("https://api.threatminer.org/v2/host.php", {
      params: { q: query, rt: 1 },
      timeout: 10000,
    });
    const data = res.data;
    return {
      status: data.status_code,
      detections: data.results?.length || 0,
      raw: data,
    };
  } catch (err) {
    return { note: "ThreatMiner lookup failed", raw: null };
  }
}

// 15. Multi-RBL
async function checkMultiRBL(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };
  const rbls = [
    "zen.spamhaus.org",
    "bl.spamcop.net",
    "b.barracudacentral.org",
    "dnsbl.sorbs.net",
    "psbl.surriel.com",
  ];
  let listedCount = 0;
  const lists = [];
  for (const rbl of rbls) {
    try {
      const reversed = ip.split(".").reverse().join(".");
      await dns.resolve4(`${reversed}.${rbl}`);
      listedCount++;
      lists.push({ name: rbl, listed: true });
    } catch {
      lists.push({ name: rbl, listed: false });
    }
  }
  return {
    listedCount,
    totalChecked: rbls.length,
    is_blacklisted: listedCount >= 2,
    lists,
    note: "Multi-RBL DNS Check (Anti-Abuse inspired)",
  };
}

// 16. IP Teoh (via VPNAPI)
async function checkIPTeoh(ip) {
  return checkVPNAPI(ip);
}

// 17. MalwareURL
async function checkMalwareURL(query) {
  try {
    const res = await axios.get(
      `https://www.malwareurl.com/ns_listing.php?ip=${encodeURIComponent(query)}`,
      { timeout: 8000 },
    );
    const isMalicious = /malware|listed|blacklisted/.test(
      res.data.toLowerCase(),
    );
    return {
      is_malicious: isMalicious,
      note: "MalwareURL basic check",
      raw: null,
    };
  } catch (err) {
    return { note: "MalwareURL check unavailable" };
  }
}

// 18. IOC.one
async function checkIOCOne(query) {
  try {
    const res = await axios.get(
      `https://ioc.one/api/search?q=${encodeURIComponent(query)}`,
      { timeout: 8000 },
    );
    return {
      hits: res.data?.hits || 0,
      is_malicious: (res.data?.hits || 0) > 0,
      raw: res.data,
    };
  } catch (err) {
    return { note: "IOC.one lookup limited/unavailable", hits: 0 };
  }
}

// 19. IPify - VPN/Proxy Detection & Geolocation
async function checkIPify(ip) {
  if (!validator.isIP(ip)) return { error: "Invalid IP" };
  try {
    // Using ipify's geo endpoint for location + proxy detection
    const res = await axios.get(
      `https://geo.ipify.org/api/v2/country,city,vpn?apiKey=${process.env.IPIFY_API_KEY}&ipAddress=${ip}`,
      {
        timeout: 10000,
      },
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
        geonameId: data.location?.geonameId,
      },
      domains: data.domains || [],
      as: {
        asn: data.as?.asn,
        name: data.as?.name,
        route: data.as?.route,
        domain: data.as?.domain,
        type: data.as?.type,
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
    return { error: err.message, note: "IPify lookup failed" };
  }
}

// ====================== EXPORT ALL ======================
module.exports = {
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
};
