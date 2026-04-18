require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const analysisRoutes = require("./routes/analysis.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// CORS configuration for frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/threat-intelligence",
  )
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    services: {
      mongodb:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      auth: "enabled",
    },
  });
});

// Mount routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api", analysisRoutes); // Analysis routes

// Centralized error handling (must be last)
app.use(errorHandler);

module.exports = app;
