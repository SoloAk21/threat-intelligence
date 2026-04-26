// src/routes/analysis.routes.js
const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysis.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const rateLimiter = require("../middlewares/rateLimiter");

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

router.post("/save", authenticateToken, analysisController.saveAnalysis);
router.get("/saved", authenticateToken, analysisController.getSavedAnalyses);
router.delete(
  "/saved/:id",
  authenticateToken,
  analysisController.deleteSavedAnalysis,
);
router.patch(
  "/saved/:id/star",
  authenticateToken,
  analysisController.toggleStarred,
);
router.patch(
  "/saved/:id",
  authenticateToken,
  analysisController.updateSavedAnalysis,
);
router.get(
  "/saved/check/:analysisId",
  authenticateToken,
  analysisController.checkSavedStatus,
);

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

router.get("/health", (req, res) => {
  res.json({
    status: "✅ Advanced Cyber Intel Server Running",
    version: "2.0.0",
    supported_types: ["ip", "url", "domain", "hash", "email"],
    cache_enabled: true,
    cache_duration: "24 hours",
    database: "MongoDB with TTL",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
