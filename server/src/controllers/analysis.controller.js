// src/controllers/analysis.controller.js
const threatService = require("../services/threat.service");
const { calculateRiskScore } = require("../utils/riskCalculator");
const { detectInputType } = require("../utils/inputDetector");
const validator = require("validator");

const analyze = async (req, res, next) => {
  try {
    const { input, type: forcedType } = req.body;

    if (!input?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Input is required",
      });
    }

    const trimmedInput = input.trim();

    // Auto-detect input type if not forced
    const analysisType = forcedType || detectInputType(trimmedInput);

    let vt,
      abuseipdb,
      otx,
      threatfox,
      pulsedive,
      greynoise,
      ipqualityscore,
      vpnapi,
      shodan,
      censys,
      ipinfo,
      talos,
      multirbl,
      inquest,
      threatminer,
      ipteoh,
      ipify,
      malwareurl,
      iocone,
      urlscan,
      urlhaus,
      sucuri;

    // IP-specific services
    if (analysisType === "ip") {
      const promises = [
        threatService.getVTReport("ip", trimmedInput),
        threatService.checkAbuseIPDB(trimmedInput),
        threatService.checkAlienVaultOTX("ip", trimmedInput),
        threatService.checkThreatFox(trimmedInput),
        threatService.checkPulsedive(trimmedInput),
        threatService.checkGreyNoise(trimmedInput),
        threatService.checkIPQualityScore(trimmedInput),
        threatService.checkVPNAPI(trimmedInput),
        threatService.checkShodanInternetDB(trimmedInput),
        threatService.checkCensys(trimmedInput),
        threatService.checkIPinfo(trimmedInput),
        threatService.checkTalos(trimmedInput),
        threatService.checkMultiRBL(trimmedInput),
        threatService.checkInQuest(trimmedInput),
        threatService.checkThreatMiner(trimmedInput),
        threatService.checkIPTeoh(trimmedInput),
        threatService.checkIPify(trimmedInput),
        threatService.checkMalwareURL(trimmedInput),
        threatService.checkIOCOne(trimmedInput),
      ];

      const results = await Promise.allSettled(promises);
      [
        vt,
        abuseipdb,
        otx,
        threatfox,
        pulsedive,
        greynoise,
        ipqualityscore,
        vpnapi,
        shodan,
        censys,
        ipinfo,
        talos,
        multirbl,
        inquest,
        threatminer,
        ipteoh,
        ipify,
        malwareurl,
        iocone,
      ] = results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: "Service failed" },
      );
    }

    // URL-specific services
    if (analysisType === "url") {
      const promises = [
        threatService.getVTReport("url", trimmedInput),
        threatService.checkAlienVaultOTX("url", trimmedInput),
        threatService.checkPulsedive(trimmedInput),
        threatService.checkThreatFox(trimmedInput),
        threatService.checkThreatMiner(trimmedInput),
        threatService.checkMalwareURL(trimmedInput),
        threatService.checkIOCOne(trimmedInput),
        threatService.checkURLScan(trimmedInput),
        threatService.checkURLHaus(trimmedInput),
        threatService.checkSucuri(trimmedInput),
      ];

      const results = await Promise.allSettled(promises);
      [
        vt,
        otx,
        pulsedive,
        threatfox,
        threatminer,
        malwareurl,
        iocone,
        urlscan,
        urlhaus,
        sucuri,
      ] = results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: "Service failed" },
      );
    }

    // Domain-specific services
    if (analysisType === "domain") {
      const promises = [
        threatService.getVTReport("domain", trimmedInput),
        threatService.checkAlienVaultOTX("domain", trimmedInput),
        threatService.checkPulsedive(trimmedInput),
        threatService.checkThreatFox(trimmedInput),
        threatService.checkThreatMiner(trimmedInput),
        threatService.checkMalwareURL(trimmedInput),
        threatService.checkIOCOne(trimmedInput),
        threatService.checkSucuri(trimmedInput),
      ];

      const results = await Promise.allSettled(promises);
      [vt, otx, pulsedive, threatfox, threatminer, malwareurl, iocone, sucuri] =
        results.map((r) =>
          r.status === "fulfilled" ? r.value : { error: "Service failed" },
        );
    }

    // File/Hash-specific services
    if (analysisType === "hash") {
      const promises = [
        threatService.getVTReport("file", trimmedInput),
        threatService.checkAlienVaultOTX("file", trimmedInput),
        threatService.checkPulsedive(trimmedInput),
        threatService.checkThreatFox(trimmedInput),
        threatService.checkMalwareURL(trimmedInput),
      ];

      const results = await Promise.allSettled(promises);
      [vt, otx, pulsedive, threatfox, malwareurl] = results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: "Service failed" },
      );
    }

    const riskScore = calculateRiskScore({
      vt,
      abuseipdb,
      otx,
      threatfox,
      pulsedive,
      greynoise,
      ipqualityscore,
      vpnapi,
      shodan,
      talos,
      multirbl,
      inquest,
      threatminer,
      malwareurl,
      ipify,
      urlscan,
      urlhaus,
      sucuri,
      analysisType,
    });

    const riskLevel =
      riskScore >= 80
        ? "CRITICAL"
        : riskScore >= 60
          ? "HIGH"
          : riskScore >= 40
            ? "MEDIUM"
            : "LOW";

    return res.json({
      success: true,
      data: {
        type: analysisType,
        input: trimmedInput,
        riskScore,
        riskLevel,
        inputType: analysisType,
        timestamp: new Date().toISOString(),
        vt,
        abuseipdb,
        otx,
        threatfox,
        pulsedive,
        greynoise,
        ipqualityscore,
        vpnapi,
        shodan,
        censys,
        ipinfo,
        talos,
        multirbl,
        inquest,
        threatminer,
        ipteoh,
        ipify,
        malwareurl,
        iocone,
        urlscan,
        urlhaus,
        sucuri,
      },
    });
  } catch (err) {
    console.error("Controller Error:", err.message);
    next(err);
  }
};

module.exports = { analyze };
