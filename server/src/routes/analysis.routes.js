// src/routes/analysis.routes.js (updated health check)
const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysis.controller");
const rateLimiter = require("../middlewares/rateLimiter");

router.post("/analyze", rateLimiter, analysisController.analyze);

router.get("/health", (req, res) => {
  res.json({
    status: "✅ Advanced Cyber Intel Server Running",
    supported_types: ["ip", "url", "domain", "hash", "email"],
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
    api_keys_configured: {
      URLSCAN: !!process.env.URLSCAN_API_KEY || "using default",
      URLHAUS: "no key required",
      SUCURI: !!process.env.SUCURI_API_KEY || "using default",
    },
    port: process.env.PORT || 5000,
  });
});

module.exports = router;
