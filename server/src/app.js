// src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const analysisRoutes = require("./routes/analysis.routes");
const authRoutes = require("./routes/auth.routes");
const apiKeyManager = require("./services/apiKeyManager");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// MongoDB connection - FIXED: Remove deprecated options
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/threat-intelligence",
  )
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

    // Create indexes for better performance (optional - will log if fails)
    try {
      const Analysis = require("./models/Analysis");
      await Analysis.createIndexes();
      console.log("✅ Database indexes created");
    } catch (indexErr) {
      console.log("ℹ️ Index creation skipped (first run)");
    }

    // Log API key status
    const keySummary = apiKeyManager.getHealthSummary();
    console.log("🔑 API Key Status:", JSON.stringify(keySummary, null, 2));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("💡 Make sure MongoDB is installed and running:");
    console.log(
      "   - Download from: https://www.mongodb.com/try/download/community",
    );
    console.log("   - Or use MongoDB Atlas: https://www.mongodb.com/atlas");
    process.exit(1);
  });

// Health check endpoint
app.get("/health", (req, res) => {
  const keyHealth = apiKeyManager.getHealthSummary();
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.json({
    status: dbStatus === "connected" ? "OK" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: dbStatus,
      auth: "enabled",
      api_keys: keyHealth,
      cache: "enabled (24h)",
      database_ttl: "30 days",
    },
    version: "2.0.0",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", analysisRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
