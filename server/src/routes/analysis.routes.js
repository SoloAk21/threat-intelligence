// src/routes/analysis.routes.js
const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysis.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const rateLimiter = require("../middlewares/rateLimiter");

// Protected routes (require authentication)
router.post(
  "/analyze",
  authenticateToken,
  rateLimiter,
  analysisController.analyze,
);
router.get(
  "/history",
  authenticateToken,
  analysisController.getAnalysisHistory,
);
router.get(
  "/analysis/:id",
  authenticateToken,
  analysisController.getAnalysisById,
);
router.delete(
  "/analysis/:id",
  authenticateToken,
  analysisController.deleteAnalysis,
);
router.get("/statistics", authenticateToken, analysisController.getStatistics);

// Admin routes for API key management
router.get(
  "/api-keys/status",
  authenticateToken,
  analysisController.getAPIKeyStatus,
);
router.post(
  "/api-keys/rotate",
  authenticateToken,
  analysisController.rotateAPIKeys,
);

// Public health check
router.get("/health", (req, res) => {
  res.json({
    status: "✅ Advanced Cyber Intel Server Running",
    version: "2.0.0",
    supported_types: ["ip", "url", "domain", "hash", "email"],
    cache_enabled: true,
    cache_duration: "24 hours",
    database: "MongoDB with TTL",
    api_key_rotation: "enabled (auto-failover)",
    features: {
      multi_api_keys: true,
      auto_rotation: true,
      response_caching: true,
      analysis_history: true,
      ai_summary: true,
    },
    supported_sources: [
      "VirusTotal",
      "AbuseIPDB",
      "OTX",
      "ThreatFox",
      "Pulsedive",
      "GreyNoise",
      "IPQualityScore",
      "VPNAPI.io",
      "Shodan",
      "Censys",
      "IPinfo",
      "Cisco Talos",
      "Multi-RBL",
      "InQuest RepDB",
      "ThreatMiner",
      "MalwareURL",
      "IOC.one",
      "IPTeoh",
      "IPify",
      "URLScan.io",
      "URLHaus",
      "Sucuri SiteCheck",
    ],
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
