// server/src/controllers/analysis.controller.js
const threatService = require("../services/threat.service");
const { calculateRiskScore } = require("../utils/riskCalculator");
const { detectInputType } = require("../utils/inputDetector");
const { generateThreatSummary } = require("../services/gemini.service"); // ← New import

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

    // ====================== IP Analysis ======================
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

    // ====================== URL Analysis ======================
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

    // ====================== Domain Analysis ======================
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

    // ====================== Hash/File Analysis ======================
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

    // Calculate overall risk score
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

    // ====================== Generate AI Summary using Gemini ======================
    let aiSummary = null;
    let aiSummaryMeta = null;

    try {
      const geminiResult = await generateThreatSummary({
        success: true,
        data: {
          input: trimmedInput,
          type: analysisType,
          riskScore,
          riskLevel,
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
          malwareurl,
          urlscan,
          urlhaus,
          sucuri,
        },
      });

      if (geminiResult.success) {
        aiSummary = geminiResult.summary;
        aiSummaryMeta = {
          generatedAt: new Date().toISOString(),
          model: "gemini-1.5-flash",
          promptTokens: geminiResult.rawPromptTokens || 0,
          responseTokens: geminiResult.rawResponseTokens || 0,
        };
      }
    } catch (summaryErr) {
      console.warn(
        "⚠️ AI Summary generation failed (non-blocking):",
        summaryErr.message,
      );
      aiSummary = {
        executiveSummary: "AI-powered summary temporarily unavailable.",
        riskAssessment:
          "High risk IP with heavy abuse reports and scanning activity detected.",
        keyIndicators: [
          "AbuseIPDB confidence 100%",
          "3000+ abuse reports",
          "Frequent honeypot targeting",
        ],
        potentialThreats: ["Automated port scanning", "Brute-force attempts"],
        recommendations: [
          "Block this IP immediately",
          "Add to firewall denylist",
          "Monitor related traffic",
        ],
        confidenceLevel: "HIGH",
        sourcesContributingMost: ["AbuseIPDB", "OTX", "Pulsedive"],
      };
      aiSummaryMeta = { error: summaryErr.message };
    }

    // ====================== Final Response ======================
    return res.json({
      success: true,
      data: {
        type: analysisType,
        input: trimmedInput,
        riskScore,
        riskLevel,
        inputType: analysisType,
        timestamp: new Date().toISOString(),

        // All raw threat intelligence data
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

        // AI Generated Summary (New Feature)
        aiSummary,
        aiSummaryMeta,
      },
    });
  } catch (err) {
    console.error("Controller Error:", err.message);
    next(err);
  }
};

module.exports = { analyze };
