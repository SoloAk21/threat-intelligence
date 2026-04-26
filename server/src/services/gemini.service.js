const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractRelevantData(threatData) {
  const type = threatData.type || "ip";
  const data = { type, input: threatData.input };

  // VirusTotal
  if (threatData.vt && !threatData.vt.error) {
    data.vt = {
      malicious: threatData.vt.last_analysis_stats?.malicious || 0,
      suspicious: threatData.vt.last_analysis_stats?.suspicious || 0,
      as_owner: threatData.vt.as_owner,
      country: threatData.vt.country,
    };
  }

  // AbuseIPDB
  if (threatData.abuseipdb && !threatData.abuseipdb.error) {
    data.abuseipdb = {
      confidence: threatData.abuseipdb.abuseConfidenceScore,
      reports: threatData.abuseipdb.totalReports,
      users: threatData.abuseipdb.numDistinctUsers,
    };
  }

  // GreyNoise
  if (threatData.greynoise && !threatData.greynoise.error) {
    data.greynoise = {
      classification: threatData.greynoise.classification,
      noise: threatData.greynoise.noise,
      riot: threatData.greynoise.riot,
    };
  }

  // OTX
  if (threatData.otx && !threatData.otx.error) {
    data.otx = { pulses: threatData.otx.pulse_count };
  }

  // Pulsedive
  if (threatData.pulsedive && !threatData.pulsedive.error) {
    data.pulsedive = {
      risk: threatData.pulsedive.risk,
      malicious: threatData.pulsedive.is_malicious,
    };
  }

  // IPinfo
  if (threatData.ipinfo && !threatData.ipinfo.error) {
    data.ipinfo = {
      country: threatData.ipinfo.country,
      city: threatData.ipinfo.city,
      org: threatData.ipinfo.org_name,
    };
  }

  // MultiRBL
  if (threatData.multirbl && !threatData.multirbl.error) {
    data.blacklists = {
      listed: threatData.multirbl.listedCount,
      total: threatData.multirbl.totalChecked,
      names: threatData.multirbl.lists
        ?.filter((l) => l.listed)
        .map((l) => l.name),
    };
  }

  return data;
}

function buildPrompt(threatData, extractedData) {
  const type = threatData.type || "ip";
  const hasData = Object.keys(extractedData).length > 2;

  if (!hasData) {
    return `Return JSON for "${threatData.input}" (${type}) with no data: {"riskScore":10,"riskLevel":"LOW","executiveSummary":"No threat data found.","riskAssessment":"• No intelligence available","keyIndicators":["No data"],"potentialThreats":["Unknown"],"recommendations":["Monitor","Re-query"],"confidenceLevel":"LOW","sourcesContributingMost":[],"tacticalAdvice":"Monitor for 48 hours"}`;
  }

  return `Analyze threat data for ${threatData.input} (${type}):

${JSON.stringify(extractedData, null, 2)}

Return ONLY valid JSON:
{
  "riskScore": number 0-100,
  "riskLevel": "CRITICAL"|"HIGH"|"MEDIUM"|"LOW",
  "executiveSummary": "1 sentence max 120 chars",
  "riskAssessment": "• bullet1\\n• bullet2\\n• bullet3",
  "keyIndicators": ["i1","i2","i3"],
  "potentialThreats": ["t1","t2","t3"],
  "recommendations": ["r1","r2","r3"],
  "confidenceLevel": "HIGH"|"MEDIUM"|"LOW",
  "sourcesContributingMost": ["s1","s2","s3"],
  "tacticalAdvice": "1 sentence max 80 chars"
}

Scoring: 80-100=CRITICAL, 60-79=HIGH, 40-59=MEDIUM, 0-39=LOW
Keep all text SHORT. Use 3 bullets max. No fluff.`;
}

function formatForScreenReader(result) {
  // Ensure riskAssessment uses bullet points
  if (result.riskAssessment && typeof result.riskAssessment === "string") {
    if (
      !result.riskAssessment.includes("•") &&
      result.riskAssessment.length > 100
    ) {
      const sentences = result.riskAssessment
        .split(/\.\s+/)
        .filter((s) => s.length > 10);
      if (sentences.length > 1) {
        result.riskAssessment = sentences
          .slice(0, 3)
          .map((s) => `• ${s}.`)
          .join("\n");
      }
    }
  }

  // Trim long strings
  if (result.executiveSummary && result.executiveSummary.length > 150) {
    result.executiveSummary = result.executiveSummary.substring(0, 147) + "...";
  }

  if (result.tacticalAdvice && result.tacticalAdvice.length > 100) {
    result.tacticalAdvice = result.tacticalAdvice.substring(0, 97) + "...";
  }

  // Ensure arrays have max 5 items
  if (result.keyIndicators)
    result.keyIndicators = result.keyIndicators.slice(0, 5);
  if (result.potentialThreats)
    result.potentialThreats = result.potentialThreats.slice(0, 4);
  if (result.recommendations)
    result.recommendations = result.recommendations.slice(0, 5);
  if (result.sourcesContributingMost)
    result.sourcesContributingMost = result.sourcesContributingMost.slice(0, 4);

  return result;
}

async function generateThreatSummaryAndRisk(threatData) {
  if (!threatData?.input) {
    throw new Error("Invalid threat data");
  }

  const extractedData = extractRelevantData(threatData);
  const prompt = buildPrompt(threatData, extractedData);

  console.log(`[Gemini] Analyzing ${threatData.input}`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        let text = response.text.trim();
        text = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        let result = JSON.parse(text);

        if (typeof result.riskScore !== "number") {
          throw new Error("Missing riskScore");
        }

        result.riskScore = Math.min(100, Math.max(0, result.riskScore));
        result = formatForScreenReader(result);

        console.log(
          `[Gemini] ✓ ${model} | Risk: ${result.riskScore} (${result.riskLevel})`,
        );

        return {
          success: true,
          summary: {
            executiveSummary: result.executiveSummary || "Analysis complete.",
            riskAssessment:
              result.riskAssessment || "• No specific risks identified",
            keyIndicators: result.keyIndicators || ["Analysis completed"],
            potentialThreats: result.potentialThreats || ["None identified"],
            recommendations: result.recommendations || ["Monitor as usual"],
            confidenceLevel: result.confidenceLevel || "MEDIUM",
            sourcesContributingMost: result.sourcesContributingMost || [
              "Available data",
            ],
            tacticalAdvice:
              result.tacticalAdvice || "Continue standard monitoring",
          },
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          modelUsed: model,
          generatedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.warn(`[Gemini] ${model} attempt ${attempt}:`, err.message);
        if (err.message?.includes("503") || err.message?.includes("429")) {
          await sleep(attempt * 2000);
        }
      }
    }
  }

  console.error(`[Gemini] All models failed for ${threatData.input}`);
  return {
    success: false,
    error: "Gemini API unavailable",
    fallbackRisk: {
      riskScore: 0,
      riskLevel: "LOW",
      summary: {
        executiveSummary: `Analysis unavailable.`,
        riskAssessment: "• AI service unavailable\n• Try again later",
        keyIndicators: ["Service unavailable"],
        potentialThreats: ["Unknown"],
        recommendations: ["Retry analysis", "Check API status"],
        confidenceLevel: "LOW",
        sourcesContributingMost: [],
        tacticalAdvice: "Re-query when available",
      },
    },
  };
}

module.exports = { generateThreatSummaryAndRisk };
