// src/models/Analysis.js
const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    // User association
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Basic indicator info
    input: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    inputType: {
      type: String,
      enum: ["ip", "url", "domain", "hash", "email"],
      required: true,
      index: true,
    },

    // Risk assessment
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
      index: true,
    },

    // AI Summary (Gemini)
    aiSummary: {
      executiveSummary: String,
      riskAssessment: String,
      keyIndicators: [String],
      potentialThreats: [String],
      recommendations: [String],
      confidenceLevel: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
      },
      sourcesContributingMost: [String],
      tacticalAdvice: String,
    },
    aiSummaryMeta: {
      generatedAt: Date,
      model: String,
      promptTokens: Number,
      responseTokens: Number,
      error: String,
    },

    // Service responses (compressed)
    serviceResponses: {
      vt: mongoose.Schema.Types.Mixed,
      abuseipdb: mongoose.Schema.Types.Mixed,
      otx: mongoose.Schema.Types.Mixed,
      threatfox: mongoose.Schema.Types.Mixed,
      pulsedive: mongoose.Schema.Types.Mixed,
      greynoise: mongoose.Schema.Types.Mixed,
      ipqualityscore: mongoose.Schema.Types.Mixed,
      vpnapi: mongoose.Schema.Types.Mixed,
      shodan: mongoose.Schema.Types.Mixed,
      censys: mongoose.Schema.Types.Mixed,
      ipinfo: mongoose.Schema.Types.Mixed,
      talos: mongoose.Schema.Types.Mixed,
      multirbl: mongoose.Schema.Types.Mixed,
      inquest: mongoose.Schema.Types.Mixed,
      threatminer: mongoose.Schema.Types.Mixed,
      ipteoh: mongoose.Schema.Types.Mixed,
      ipify: mongoose.Schema.Types.Mixed,
      malwareurl: mongoose.Schema.Types.Mixed,
      iocone: mongoose.Schema.Types.Mixed,
      urlscan: mongoose.Schema.Types.Mixed,
      urlhaus: mongoose.Schema.Types.Mixed,
      sucuri: mongoose.Schema.Types.Mixed,
    },

    // Performance metrics
    analysisDuration: {
      type: Number,
      default: 0,
    },

    // Request metadata
    clientIp: String,
    userAgent: String,

    // Cache control
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: "2592000" }, // 30 days TTL (30 * 24 * 60 * 60)
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound indexes for common query patterns
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ userId: 1, riskLevel: 1, createdAt: -1 });
analysisSchema.index({ userId: 1, inputType: 1, createdAt: -1 });
analysisSchema.index({ input: 1, inputType: 1, createdAt: -1 });
analysisSchema.index({ riskScore: -1, createdAt: -1 });

// Text search index
analysisSchema.index({ input: "text" });

// Virtual for age in days
analysisSchema.virtual("ageInDays").get(function () {
  const ageMs = Date.now() - this.createdAt;
  return Math.floor(ageMs / (1000 * 60 * 60 * 24));
});

// Method to compress responses before saving
analysisSchema.methods.compressResponses = function () {
  // Fields that can be truncated or removed
  const largeArrayFields = ["reports", "pulses", "threats", "results", "lists"];
  const largeObjectFields = ["raw", "enriched", "data", "attributes"];

  const compressObject = (obj, depth = 0) => {
    if (!obj || typeof obj !== "object" || depth > 3) return obj;
    if (Array.isArray(obj)) {
      if (obj.length > 20) {
        return {
          truncated: true,
          originalLength: obj.length,
          preview: obj.slice(0, 20),
          totalCount: obj.length,
        };
      }
      return obj.map((item) => compressObject(item, depth + 1));
    }

    const compressed = { ...obj };

    for (const field of largeArrayFields) {
      if (
        compressed[field] &&
        Array.isArray(compressed[field]) &&
        compressed[field].length > 20
      ) {
        compressed[field] = {
          truncated: true,
          originalLength: compressed[field].length,
          preview: compressed[field].slice(0, 20),
          totalCount: compressed[field].length,
        };
      }
    }

    for (const field of largeObjectFields) {
      if (compressed[field] && typeof compressed[field] === "object") {
        if (Object.keys(compressed[field]).length > 50) {
          compressed[`${field}_summary`] = {
            type: typeof compressed[field],
            keys: Object.keys(compressed[field]).slice(0, 20),
            totalKeys: Object.keys(compressed[field]).length,
          };
          delete compressed[field];
        }
      }
    }

    return compressed;
  };

  // Compress each service response
  for (const service of Object.keys(this.serviceResponses)) {
    if (this.serviceResponses[service]) {
      this.serviceResponses[service] = compressObject(
        this.serviceResponses[service],
      );
    }
  }

  return this;
};

// Static method to find recent analysis (for caching)
analysisSchema.statics.findRecent = async function (
  input,
  inputType,
  hours = 24,
) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);

  return await this.findOne({
    input: input.toLowerCase(),
    inputType,
    createdAt: { $gte: cutoff },
  }).sort({ createdAt: -1 });
};

// Static method to get aggregated statistics for a user
analysisSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        riskDistribution: [
          { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
        ],
        typeDistribution: [
          { $group: { _id: "$inputType", count: { $sum: 1 } } },
        ],
        averageRisk: [{ $group: { _id: null, avg: { $avg: "$riskScore" } } }],
        topThreats: [
          { $sort: { riskScore: -1 } },
          { $limit: 10 },
          { $project: { input: 1, riskScore: 1, riskLevel: 1, createdAt: 1 } },
        ],
        dailyActivity: [
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 30 },
        ],
      },
    },
  ]);

  return stats[0];
};

// Pre-save middleware to update timestamps and compress
analysisSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (this.isModified("serviceResponses")) {
    this.compressResponses();
  }
  next();
});

module.exports = mongoose.model("Analysis", analysisSchema);
