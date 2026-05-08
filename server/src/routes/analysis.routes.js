const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysis.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const rateLimiter = require("../middlewares/rateLimiter");

// Analysis endpoints
router.post(
  "/analyze",
  authenticateToken,
  rateLimiter,
  analysisController.analyze,
);

// Save endpoints (USER MUST CLICK SAVE BUTTON)
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

// History and retrieval
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

// Statistics
router.get("/statistics", authenticateToken, analysisController.getStatistics);

// API Key management
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

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "✅ Advanced Cyber Intel Server Running",
    version: "3.0.0",
    supported_types: ["ip", "url", "domain", "hash", "email"],
    auto_save: false,
    save_required: true,
    temp_storage_duration: "1 hour",
    database: "MongoDB with manual save only",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
