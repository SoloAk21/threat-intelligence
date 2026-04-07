// src/controllers/analysis.controller.js
const threatService = require("../services/threat.service");
const { calculateRiskScore } = require("../utils/riskCalculator");
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

    let analysisType = forcedType || "ip";
    if (!forcedType && validator.isIP(trimmedInput)) {
      analysisType = "ip";
    }

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
      iocone;

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
      ] = results.map((result) =>
        result.status === "fulfilled"
          ? result.value
          : { error: "Service failed" },
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
    });

    const riskLevel =
      riskScore >= 80
        ? "CRITICAL"
        : riskScore >= 60
          ? "HIGH"
          : riskScore >= 40
            ? "MEDIUM"
            : "LOW";

    // Wrap the response in a 'data' field to match frontend expectations
    return res.json({
      success: true,
      data: {
        // <-- ADD THIS WRAPPER
        type: analysisType,
        input: trimmedInput,
        riskScore,
        riskLevel,
        inputType: analysisType, // <-- ADD THIS for frontend compatibility
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
      },
    });
  } catch (err) {
    console.error("Controller Error:", err.message);
    next(err);
  }
};

module.exports = { analyze };
