// src/controllers/analysis.controller.js
const threatService = require("../services/threat.service");
const { calculateRiskScore } = require("../utils/riskCalculator");
const { detectInputType } = require("../utils/inputDetector");
const { generateThreatSummary } = require("../services/gemini.service");
const Analysis = require("../models/Analysis");
const apiKeyManager = require("../services/apiKeyManager");

const analyze = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { input, type: forcedType, skipCache = false } = req.body;
    const userId = req.userId;

    if (!input?.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Input is required" });
    }

    const trimmedInput = input.trim();
    const analysisType = forcedType || detectInputType(trimmedInput);

    // Check cache (24 hours)
    if (!skipCache) {
      const cachedAnalysis = await Analysis.findRecent(
        trimmedInput,
        analysisType,
        24,
      );
      if (cachedAnalysis) {
        console.log(`[Cache] Returning cached analysis for ${trimmedInput}`);
        return res.json({
          success: true,
          fromCache: true,
          cachedAt: cachedAnalysis.createdAt,
          data: {
            type: cachedAnalysis.inputType,
            input: cachedAnalysis.input,
            riskScore: cachedAnalysis.riskScore,
            riskLevel: cachedAnalysis.riskLevel,
            aiSummary: cachedAnalysis.aiSummary,
            analysisId: cachedAnalysis._id,
            timestamp: cachedAnalysis.createdAt,
          },
        });
      }
    }

    // Initialize variables for all services
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

    // Calculate risk score
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

    // Generate AI summary
    let aiSummary = null,
      aiSummaryMeta = null;
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
          model: geminiResult.modelUsed,
          promptTokens: geminiResult.rawPromptTokens || 0,
          responseTokens: geminiResult.rawResponseTokens || 0,
        };
      }
    } catch (summaryErr) {
      console.warn("⚠️ AI Summary failed:", summaryErr.message);
      aiSummaryMeta = { error: summaryErr.message };
    }

    // Prepare for database storage
    const analysisData = {
      userId,
      input: trimmedInput,
      inputType: analysisType,
      riskScore,
      riskLevel,
      aiSummary,
      aiSummaryMeta,
      serviceResponses: {
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
        iocone,
        ipify,
        ipteoh,
        urlscan,
        urlhaus,
        sucuri,
      },
      analysisDuration: Date.now() - startTime,
      clientIp: req.ip,
      userAgent: req.get("user-agent"),
    };

    // Save to database asynchronously
    const analysis = new Analysis(analysisData);
    analysis.compressResponses(); // Compress before saving
    analysis
      .save()
      .catch((err) => console.error("Failed to save analysis:", err));

    // Return response
    return res.json({
      success: true,
      data: {
        type: analysisType,
        input: trimmedInput,
        riskScore,
        riskLevel,
        timestamp: new Date().toISOString(),
        analysisDuration: analysisData.analysisDuration,
        analysisId: analysis._id,
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
        iocone,
        ipify,
        ipteoh,
        urlscan,
        urlhaus,
        sucuri,
        aiSummary,
        aiSummaryMeta,
      },
    });
  } catch (err) {
    console.error("Controller Error:", err);
    next(err);
  }
};

// Get analysis history for the authenticated user
const getAnalysisHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      limit = 50,
      offset = 0,
      riskLevel,
      inputType,
      startDate,
      endDate,
    } = req.query;

    const query = { userId };
    if (riskLevel) query.riskLevel = riskLevel;
    if (inputType) query.inputType = inputType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [analyses, total] = await Promise.all([
      Analysis.find(query)
        .sort({ createdAt: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .select(
          "input inputType riskScore riskLevel aiSummary analysisDuration createdAt",
        ),
      Analysis.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        analyses,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single analysis by ID
const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const analysis = await Analysis.findOne({ _id: id, userId });
    if (!analysis) {
      return res
        .status(404)
        .json({ success: false, error: "Analysis not found" });
    }

    res.json({ success: true, data: analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete analysis
const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await Analysis.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Analysis not found" });
    }

    res.json({ success: true, message: "Analysis deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get user statistics
const getStatistics = async (req, res) => {
  try {
    const userId = req.userId;

    const [
      totalAnalyses,
      riskDistribution,
      typeDistribution,
      averageRisk,
      last7Days,
    ] = await Promise.all([
      Analysis.countDocuments({ userId }),
      Analysis.aggregate([
        { $match: { userId } },
        { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
      ]),
      Analysis.aggregate([
        { $match: { userId } },
        { $group: { _id: "$inputType", count: { $sum: 1 } } },
      ]),
      Analysis.aggregate([
        { $match: { userId } },
        { $group: { _id: null, avgRisk: { $avg: "$riskScore" } } },
      ]),
      Analysis.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalAnalyses,
        riskDistribution: riskDistribution.reduce(
          (acc, item) => ({ ...acc, [item._id]: item.count }),
          {},
        ),
        typeDistribution: typeDistribution.reduce(
          (acc, item) => ({ ...acc, [item._id]: item.count }),
          {},
        ),
        averageRisk: averageRisk[0]?.avgRisk || 0,
        last7DaysActivity: last7Days.map((day) => ({
          date: day._id,
          count: day.count,
        })),
      },
    });
  } catch (err) {
    console.error("Statistics error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get API key status (admin only)
const getAPIKeyStatus = async (req, res) => {
  try {
    const services = [
      "VT_API",
      "ABUSEIPDB_API",
      "OTX_API",
      "THREATFOX_AUTH",
      "PULSEDIVE_API",
      "GREYNOISE_API",
      "IPQUALITYSCORE_API",
      "VPNAPI",
      "SHODAN_API",
      "CENSYS_API",
      "IPINFO",
      "IPIFY_API",
      "URLSCAN_API",
      "URLHAUS_API",
      "SUCURI_API",
      "GEMINI_API",
    ];

    const status = {};
    for (const service of services) {
      status[service] = apiKeyManager.getKeyStatus(service);
    }

    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Rotate API keys manually
const rotateAPIKeys = async (req, res) => {
  try {
    const { service } = req.body;
    if (!service) {
      return res
        .status(400)
        .json({ success: false, error: "Service name required" });
    }

    apiKeyManager.rotateKey(service);
    res.json({ success: true, message: `API key rotated for ${service}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  analyze,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysis,
  getStatistics,
  getAPIKeyStatus,
  rotateAPIKeys,
};
