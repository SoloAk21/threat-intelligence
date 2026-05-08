const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    input: {
      type: String,
      required: true,
      index: true,
    },
    inputType: {
      type: String,
      enum: ["ip", "url", "domain", "hash", "email"],
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      required: true,
    },
    aiSummary: {
      executiveSummary: String,
      riskAssessment: String,
      keyIndicators: [String],
      potentialThreats: [String],
      recommendations: [String],
      confidenceLevel: String,
      sourcesContributingMost: [String],
      tacticalAdvice: String,
    },
    aiSummaryMeta: {
      generatedAt: Date,
      model: String,
      promptTokens: Number,
      responseTokens: Number,
      riskCalculatedBy: String,
      fallbackUsed: Boolean,
      error: String,
    },
    serviceResponses: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    analysisDuration: Number,
    clientIp: String,
    userAgent: String,
    saved: {
      type: Boolean,
      default: false,
      index: true,
    },
    savedAt: Date,
    notes: {
      type: String,
      default: "",
    },
    tags: [String],
    starred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index - ONLY for unsaved analyses (deleted after 7 days)
analysisSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 7 * 24 * 60 * 60, // 7 days
    partialFilterExpression: { saved: false },
  },
);

// Saved analyses never expire (no TTL)
// Indexes for performance
analysisSchema.index({ userId: 1, saved: 1, createdAt: -1 });
analysisSchema.index({ userId: 1, starred: 1, saved: 1 });
analysisSchema.index({ userId: 1, tags: 1 });
analysisSchema.index({ userId: 1, input: 1, saved: 1 });

analysisSchema.methods.compressResponses = function () {
  if (this.serviceResponses?.vt?.last_analysis_results) {
    // Keep for now
  }
  return this;
};

analysisSchema.statics.findRecent = function (input, inputType, hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.findOne({
    input,
    inputType,
    saved: true, // Only return saved analyses for cache
    createdAt: { $gte: cutoff },
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model("Analysis", analysisSchema);
