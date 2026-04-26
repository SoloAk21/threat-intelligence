// src/controllers/analysis.controller.js
const threatService = require("../services/threat.service");
const { detectInputType } = require("../utils/inputDetector");
const { generateThreatSummaryAndRisk } = require("../services/gemini.service");
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

    if (!skipCache) {
      const cachedAnalysis = await Analysis.findRecent(
        trimmedInput,
        analysisType,
        24,
      );
      if (cachedAnalysis) {
        console.log(`[Cache] Returning cached analysis for ${trimmedInput}`);

        // Return FULL data from cached analysis
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
            aiSummaryMeta: cachedAnalysis.aiSummaryMeta,
            analysisId: cachedAnalysis._id,
            timestamp: cachedAnalysis.createdAt,
            analysisDuration: cachedAnalysis.analysisDuration,
            // Full service responses
            vt: cachedAnalysis.serviceResponses?.vt,
            abuseipdb: cachedAnalysis.serviceResponses?.abuseipdb,
            otx: cachedAnalysis.serviceResponses?.otx,
            threatfox: cachedAnalysis.serviceResponses?.threatfox,
            pulsedive: cachedAnalysis.serviceResponses?.pulsedive,
            greynoise: cachedAnalysis.serviceResponses?.greynoise,
            ipqualityscore: cachedAnalysis.serviceResponses?.ipqualityscore,
            vpnapi: cachedAnalysis.serviceResponses?.vpnapi,
            shodan: cachedAnalysis.serviceResponses?.shodan,
            censys: cachedAnalysis.serviceResponses?.censys,
            ipinfo: cachedAnalysis.serviceResponses?.ipinfo,
            talos: cachedAnalysis.serviceResponses?.talos,
            multirbl: cachedAnalysis.serviceResponses?.multirbl,
            inquest: cachedAnalysis.serviceResponses?.inquest,
            threatminer: cachedAnalysis.serviceResponses?.threatminer,
            malwareurl: cachedAnalysis.serviceResponses?.malwareurl,
            iocone: cachedAnalysis.serviceResponses?.iocone,
            ipify: cachedAnalysis.serviceResponses?.ipify,
            ipteoh: cachedAnalysis.serviceResponses?.ipteoh,
            urlscan: cachedAnalysis.serviceResponses?.urlscan,
            urlhaus: cachedAnalysis.serviceResponses?.urlhaus,
            sucuri: cachedAnalysis.serviceResponses?.sucuri,
          },
        });
      }
    }

    // Initialize variables
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

    // IP Analysis
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

    // URL Analysis
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

    // Domain Analysis
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

    // Hash Analysis
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

    const threatData = {
      input: trimmedInput,
      type: analysisType,
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
      iocone,
      ipify,
      ipteoh,
      urlscan,
      urlhaus,
      sucuri,
    };

    let aiSummary = null,
      aiSummaryMeta = null;
    let riskScore = 0;
    let riskLevel = "LOW";

    try {
      const geminiResult = await generateThreatSummaryAndRisk(threatData);

      if (geminiResult.success) {
        aiSummary = geminiResult.summary;
        riskScore = geminiResult.riskScore;
        riskLevel = geminiResult.riskLevel;
        aiSummaryMeta = {
          generatedAt: new Date().toISOString(),
          model: geminiResult.modelUsed,
          promptTokens: geminiResult.rawPromptTokens || 0,
          responseTokens: geminiResult.rawResponseTokens || 0,
          riskCalculatedBy: "gemini-ai",
        };
      } else {
        riskScore = calculateFallbackRisk(threatData);
        riskLevel =
          riskScore >= 80
            ? "CRITICAL"
            : riskScore >= 60
              ? "HIGH"
              : riskScore >= 40
                ? "MEDIUM"
                : "LOW";
        aiSummaryMeta = { error: geminiResult.error, fallbackUsed: true };
      }
    } catch (summaryErr) {
      console.warn("⚠️ AI Summary failed:", summaryErr.message);
      riskScore = calculateFallbackRisk(threatData);
      riskLevel =
        riskScore >= 80
          ? "CRITICAL"
          : riskScore >= 60
            ? "HIGH"
            : riskScore >= 40
              ? "MEDIUM"
              : "LOW";
      aiSummaryMeta = { error: summaryErr.message, fallbackUsed: true };
    }

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

    const analysis = new Analysis(analysisData);
    analysis.compressResponses();
    await analysis.save();

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

const calculateFallbackRisk = (data) => {
  let riskScore = 0;
  let factors = 0;

  if (data.vt?.last_analysis_stats?.malicious) {
    riskScore += Math.min(40, data.vt.last_analysis_stats.malicious * 8);
    factors++;
  }

  if (data.abuseipdb?.abuseConfidenceScore) {
    riskScore += data.abuseipdb.abuseConfidenceScore * 0.4;
    factors++;
  }

  if (data.greynoise?.classification === "malicious") {
    riskScore += 35;
    factors++;
  } else if (data.greynoise?.classification === "benign") {
    riskScore += 5;
    factors++;
  }

  if (data.ipqualityscore?.fraud_score) {
    riskScore += data.ipqualityscore.fraud_score * 0.35;
    factors++;
  }

  return factors > 0
    ? Math.min(100, Math.round((riskScore / factors) * 1.5))
    : 0;
};

const saveAnalysis = async (req, res) => {
  try {
    const { analysisId, notes, tags } = req.body;
    const userId = req.userId;

    if (!analysisId) {
      return res
        .status(400)
        .json({ success: false, error: "Analysis ID required" });
    }

    const analysis = await Analysis.findOne({ _id: analysisId, userId });
    if (!analysis) {
      return res
        .status(404)
        .json({ success: false, error: "Analysis not found" });
    }

    analysis.saved = !analysis.saved;
    analysis.savedAt = analysis.saved ? new Date() : null;
    if (notes !== undefined) analysis.notes = notes;
    if (tags !== undefined) analysis.tags = tags;

    await analysis.save();

    res.json({
      success: true,
      data: analysis,
      message: analysis.saved ? "Analysis saved" : "Analysis unsaved",
    });
  } catch (err) {
    console.error("Save analysis error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getSavedAnalyses = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, offset = 0, riskLevel, inputType, starred } = req.query;

    const query = { userId, saved: true };
    if (riskLevel) query.riskLevel = riskLevel;
    if (inputType) query.inputType = inputType;
    if (starred === "true") query.starred = true;

    const [saved, total] = await Promise.all([
      Analysis.find(query)
        .sort({ starred: -1, savedAt: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit)),
      Analysis.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { saved, total, limit: parseInt(limit), offset: parseInt(offset) },
    });
  } catch (err) {
    console.error("Get saved analyses error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteSavedAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const analysis = await Analysis.findOne({ _id: id, userId, saved: true });
    if (!analysis) {
      return res
        .status(404)
        .json({ success: false, error: "Saved analysis not found" });
    }

    analysis.saved = false;
    analysis.savedAt = null;
    await analysis.save();

    res.json({ success: true, message: "Removed from saved analyses" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const toggleStarred = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const analysis = await Analysis.findOne({ _id: id, userId, saved: true });
    if (!analysis) {
      return res
        .status(404)
        .json({ success: false, error: "Analysis not found" });
    }

    analysis.starred = !analysis.starred;
    await analysis.save();

    res.json({
      success: true,
      data: analysis,
      message: analysis.starred ? "Starred" : "Unstarred",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateSavedAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { notes, tags } = req.body;

    const analysis = await Analysis.findOne({ _id: id, userId, saved: true });
    if (!analysis) {
      return res
        .status(404)
        .json({ success: false, error: "Analysis not found" });
    }

    if (notes !== undefined) analysis.notes = notes;
    if (tags !== undefined) analysis.tags = tags;
    await analysis.save();

    res.json({ success: true, data: analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const checkSavedStatus = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const userId = req.userId;

    const analysis = await Analysis.findOne({ _id: analysisId, userId });

    res.json({
      success: true,
      saved: analysis?.saved || false,
      id: analysis?._id || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

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
        .limit(parseInt(limit)),
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

const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { force } = req.query;

    const analysis = await Analysis.findOne({ _id: id, userId });
    if (!analysis) {
      return res
        .status(404)
        .json({ success: false, error: "Analysis not found" });
    }

    if (analysis.saved && force !== "true") {
      return res.status(400).json({
        success: false,
        error: "Cannot delete saved analysis. Unsave first or use force=true.",
      });
    }

    await analysis.deleteOne();
    res.json({ success: true, message: "Analysis deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

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
  saveAnalysis,
  getSavedAnalyses,
  deleteSavedAnalysis,
  toggleStarred,
  updateSavedAnalysis,
  checkSavedStatus,
};
