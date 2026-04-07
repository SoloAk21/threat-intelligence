const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysis.controller");
const rateLimiter = require("../middlewares/rateLimiter");

router.post("/analyze", rateLimiter, analysisController.analyze);

// Health check (no rate limit)
router.get("/health", (req, res) => {
  res.json({
    status: "✅ Advanced Cyber Intel Server Running",
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
      "Cisco Talos (scrape)",
      "Multi-RBL",
      "InQuest RepDB",
      "ThreatMiner",
      "MalwareURL",
      "IOC.one",
      "IPTeoh",
      "IPify",
    ],
    port: process.env.PORT || 5000,
  });
});

module.exports = router;
