const threatService = require("../services/threat.service");
const { detectInputType } = require("../utils/inputDetector");
const { generateThreatSummaryAndRisk } = require("../services/gemini.service");
const Analysis = require("../models/Analysis");
const apiKeyManager = require("../services/apiKeyManager");
const mongoose = require("mongoose");

// In-memory cache for temporary analyses (expires after 1 hour)
const temporaryAnalyses = new Map();

// Clean up expired temporary analyses every 30 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [id, data] of temporaryAnalyses.entries()) {
      if (data.expiresAt < now) {
        temporaryAnalyses.delete(id);
        console.log(`[TempCache] Cleaned up expired analysis: ${id}`);
      }
    }
  },
  30 * 60 * 1000,
);

const analyze = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { input, type: forcedType } = req.body;
    const userId = req.userId;

    if (!input?.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Input is required" });
    }

    const trimmedInput = input.trim();
    const analysisType = forcedType || detectInputType(trimmedInput);

    console.log(
      `[Analysis] Checking for ${trimmedInput} (${analysisType}) in saved database first...`,
    );

    // STEP 1: Check saved database for existing analysis
    const existingAnalysis = await Analysis.findOne({
      userId,
      input: trimmedInput,
      inputType: analysisType,
      saved: true, // Only check saved analyses
    }).sort({ createdAt: -1 }); // Get the most recent one if multiple exist

    // STEP 2: If found in database, return it directly (fast path)
    if (existingAnalysis) {
      console.log(
        `[Analysis] Found saved analysis in database for ${trimmedInput} - returning cached result (ID: ${existingAnalysis._id})`,
      );

      // Update the analysis duration to show it was cached
      const cachedDuration = Date.now() - startTime;

      return res.json({
        success: true,
        cached: true,
        message: "Retrieved from saved analyses (fast cache hit)",
        data: {
          _id: existingAnalysis._id,
          type: existingAnalysis.inputType,
          input: existingAnalysis.input,
          riskScore: existingAnalysis.riskScore,
          riskLevel: existingAnalysis.riskLevel,
          aiSummary: existingAnalysis.aiSummary,
          aiSummaryMeta: existingAnalysis.aiSummaryMeta,
          timestamp: existingAnalysis.createdAt,
          analysisDuration: cachedDuration,
          savedAt: existingAnalysis.savedAt,
          notes: existingAnalysis.notes,
          tags: existingAnalysis.tags,
          starred: existingAnalysis.starred,
          vt: existingAnalysis.serviceResponses?.vt,
          abuseipdb: existingAnalysis.serviceResponses?.abuseipdb,
          otx: existingAnalysis.serviceResponses?.otx,
          threatfox: existingAnalysis.serviceResponses?.threatfox,
          pulsedive: existingAnalysis.serviceResponses?.pulsedive,
          greynoise: existingAnalysis.serviceResponses?.greynoise,
          ipqualityscore: existingAnalysis.serviceResponses?.ipqualityscore,
          vpnapi: existingAnalysis.serviceResponses?.vpnapi,
          shodan: existingAnalysis.serviceResponses?.shodan,
          censys: existingAnalysis.serviceResponses?.censys,
          ipinfo: existingAnalysis.serviceResponses?.ipinfo,
          talos: existingAnalysis.serviceResponses?.talos,
          multirbl: existingAnalysis.serviceResponses?.multirbl,
          inquest: existingAnalysis.serviceResponses?.inquest,
          threatminer: existingAnalysis.serviceResponses?.threatminer,
          ipteoh: existingAnalysis.serviceResponses?.ipteoh,
          ipify: existingAnalysis.serviceResponses?.ipify,
          malwareurl: existingAnalysis.serviceResponses?.malwareurl,
          iocone: existingAnalysis.serviceResponses?.iocone,
          urlscan: existingAnalysis.serviceResponses?.urlscan,
          urlhaus: existingAnalysis.serviceResponses?.urlhaus,
          sucuri: existingAnalysis.serviceResponses?.sucuri,
        },
      });
    }

    console.log(
      `[Analysis] No saved analysis found - performing fresh external analysis for ${trimmedInput}`,
    );

    // STEP 3: If not found, proceed with external API calls (original logic)
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

    // Create temporary ID for frontend reference
    const tempId = new mongoose.Types.ObjectId().toString();

    const analysisData = {
      _id: tempId,
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
      saved: false,
      savedAt: null,
      notes: "",
      tags: [],
      starred: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in temporary memory cache (expires in 1 hour)
    temporaryAnalyses.set(tempId, {
      ...analysisData,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour TTL
    });

    console.log(
      `[Analysis] Temporary analysis stored with ID: ${tempId} (expires in 1 hour)`,
    );

    // Return analysis result WITHOUT saving to database
    return res.json({
      success: true,
      cached: false,
      temporary: true,
      tempId: tempId,
      message:
        "Analysis complete. Click save to permanently store this analysis.",
      data: {
        _id: tempId,
        type: analysisType,
        input: trimmedInput,
        riskScore,
        riskLevel,
        aiSummary,
        aiSummaryMeta,
        timestamp: new Date().toISOString(),
        analysisDuration: analysisData.analysisDuration,
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
    });
  } catch (err) {
    console.error("Controller Error:", err);
    next(err);
  }
};
const saveAnalysis = async (req, res) => {
  try {
    const { tempId, notes, tags } = req.body;
    const userId = req.userId;

    if (!tempId) {
      return res
        .status(400)
        .json({ success: false, error: "Temporary analysis ID required" });
    }

    // Get from temporary storage
    const tempData = temporaryAnalyses.get(tempId);

    if (!tempData) {
      return res.status(404).json({
        success: false,
        error: "Analysis expired or not found. Please re-run the analysis.",
      });
    }

    // Check if this user owns the temporary analysis
    if (tempData.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, error: "Unauthorized to save this analysis" });
    }

    // Check if already saved
    const existingSaved = await Analysis.findOne({
      userId,
      input: tempData.input,
      inputType: tempData.inputType,
      saved: true,
    });

    if (existingSaved) {
      return res.status(409).json({
        success: false,
        error:
          "An analysis with this input already exists in your saved analyses",
        existingId: existingSaved._id,
      });
    }

    // Create new database document
    const analysis = new Analysis({
      userId: tempData.userId,
      input: tempData.input,
      inputType: tempData.inputType,
      riskScore: tempData.riskScore,
      riskLevel: tempData.riskLevel,
      aiSummary: tempData.aiSummary,
      aiSummaryMeta: tempData.aiSummaryMeta,
      serviceResponses: tempData.serviceResponses,
      analysisDuration: tempData.analysisDuration,
      clientIp: tempData.clientIp,
      userAgent: tempData.userAgent,
      saved: true,
      savedAt: new Date(),
      notes: notes || tempData.notes || "",
      tags: tags || tempData.tags || [],
      starred: false,
    });

    await analysis.save();

    // Remove from temporary storage
    temporaryAnalyses.delete(tempId);

    console.log(`[Analysis] Saved permanently with ID: ${analysis._id}`);

    res.json({
      success: true,
      data: analysis,
      message: "Analysis saved successfully",
    });
  } catch (err) {
    console.error("Save analysis error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// In your getSavedAnalyses controller
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

    // Transform data to include all needed fields
    const transformedData = saved.map((analysis) => {
      const obj = analysis.toObject();
      return {
        ...obj,
        analysisId: obj._id.toString(), // Add analysisId field
        saved: true, // Ensure saved flag is true
        _id: obj._id.toString(), // Keep _id as string
      };
    });

    res.json({
      success: true,
      data: {
        saved: transformedData,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
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

    // Option 1: Hard delete (actually remove from database)
    const analysis = await Analysis.findOneAndDelete({
      _id: id,
      userId,
      saved: true,
    });

    if (!analysis) {
      return res
        .status(404)
        .json({ success: false, error: "Saved analysis not found" });
    }

    console.log(`[Analysis] Permanently deleted saved analysis: ${id}`);

    res.json({
      success: true,
      message: "Analysis permanently deleted from saved analyses",
    });

    /* Option 2: Soft delete (just mark as not saved) - use this if you want to keep data
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
    */
  } catch (err) {
    console.error("Delete saved analysis error:", err);
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

    // First check database
    let analysis = await Analysis.findOne({ _id: id, userId });

    // If not in database, check temporary storage
    if (!analysis && temporaryAnalyses.has(id)) {
      const tempData = temporaryAnalyses.get(id);
      if (tempData.userId.toString() === userId) {
        analysis = tempData;
      }
    }

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

module.exports = {
  analyze,
  saveAnalysis,
  getSavedAnalyses,
  deleteSavedAnalysis,
  toggleStarred,
  updateSavedAnalysis,
  checkSavedStatus,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysis,
  getStatistics,
  getAPIKeyStatus,
  rotateAPIKeys,
};
