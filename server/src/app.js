require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const analysisRoutes = require("./routes/analysis.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Mount all routes under /api
app.use("/api", analysisRoutes);

// Centralized error handling (must be last)
app.use(errorHandler);

module.exports = app;
