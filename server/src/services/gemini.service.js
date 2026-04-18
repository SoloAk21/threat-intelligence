// src/services/gemini.service.js
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateThreatSummary(analysisData) {
  if (!analysisData?.data) {
    throw new Error("Invalid analysis data");
  }

  const d = analysisData.data;

  const prompt = `
You are a world-class senior cybersecurity threat intelligence analyst with 15+ years of experience in SOC, DFIR, and threat hunting.

**Indicator**: ${d.input} (${d.type || "ip"})
**Risk Score**: ${d.riskScore || 0}/100 (${d.riskLevel || "CRITICAL"})

**Key Intelligence Signals**:
- VirusTotal: ${d.vt?.last_analysis_stats?.malicious || 0} malicious / ${d.vt?.last_analysis_stats?.suspicious || 0} suspicious detections
- AbuseIPDB: ${d.abuseipdb?.abuseConfidenceScore || 0}% confidence (${d.abuseipdb?.totalReports || 0} reports)
- AlienVault OTX: ${d.otx?.pulse_count || 0} pulses
- Pulsedive Risk: ${d.pulsedive?.risk || "none"}
- GreyNoise Classification: ${d.greynoise?.classification || "unknown"} ${d.greynoise?.noise ? "(Active Noise/Scanner)" : ""}
- High Activity: ${(d.abuseipdb?.totalReports || 0) > 1000 || (d.otx?.pulse_count || 0) > 30 ? "YES" : "NO"}

**Task**: Provide a **clear, professional, and actionable** threat summary optimized for security analysts and decision makers. 
Use concise but informative language. Avoid repetition. Focus on real risk and immediate next steps.

Return **ONLY** valid JSON with these exact keys (no extra text, no markdown):

{
  "executiveSummary": "A powerful, single-paragraph executive overview (max 2-3 sentences)",
  "riskAssessment": "Clear explanation of the main drivers behind the risk score and why it is critical/high/medium",
  "keyIndicators": ["Short, impactful bullet point 1", "Short, impactful bullet point 2", "... (max 6)"],
  "potentialThreats": ["Specific realistic threats this IP poses", "... (max 5)"],
  "recommendations": ["Immediate actionable recommendation 1", "Recommendation 2", "... (max 6, prioritized)"],
  "confidenceLevel": "HIGH | MEDIUM | LOW",
  "sourcesContributingMost": ["AbuseIPDB", "OTX", "VirusTotal", ... (top 3-4 sources)"],
  "tacticalAdvice": "One short sentence with the most important tactical action for defenders"
}
`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        let text = response.text.trim();
        // Clean possible code blocks
        text = text.replace(/```json\n?|\n?```/g, "").trim();

        const summary = JSON.parse(text);

        console.log(`[Gemini] ✓ Success with ${model}`);
        return {
          success: true,
          summary,
          modelUsed: model,
          generatedAt: new Date().toISOString(),
        };
      } catch (err) {
        const msg = err.message || JSON.stringify(err);
        console.warn(`[Gemini] ${model} failed: ${msg.substring(0, 150)}...`);

        if (msg.includes("503") && attempt < 3) {
          await sleep(attempt * 2200);
        }
      }
    }
  }

  throw new Error("Gemini unavailable after retries");
}

module.exports = { generateThreatSummary };
