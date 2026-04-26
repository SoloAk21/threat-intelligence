// src/services/gemini.service.js
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
      harmless: threatData.vt.last_analysis_stats?.harmless || 0,
      undetected: threatData.vt.last_analysis_stats?.undetected || 0,
      as_owner: threatData.vt.as_owner,
      country: threatData.vt.country,
      jarm: threatData.vt.jarm,
    };
  }

  // AbuseIPDB
  if (threatData.abuseipdb && !threatData.abuseipdb.error) {
    data.abuseipdb = {
      confidence_score: threatData.abuseipdb.abuseConfidenceScore,
      total_reports: threatData.abuseipdb.totalReports,
      distinct_users: threatData.abuseipdb.numDistinctUsers,
      country: threatData.abuseipdb.countryCode,
      isp: threatData.abuseipdb.isp,
      usage_type: threatData.abuseipdb.usageType,
      last_reported: threatData.abuseipdb.lastReportedAt,
    };
  }

  // GreyNoise
  if (threatData.greynoise && !threatData.greynoise.error) {
    data.greynoise = {
      classification: threatData.greynoise.classification,
      noise: threatData.greynoise.noise,
      riot: threatData.greynoise.riot,
      name: threatData.greynoise.name,
      last_seen: threatData.greynoise.last_seen,
    };
  }

  // AlienVault OTX
  if (threatData.otx && !threatData.otx.error) {
    data.otx = {
      pulse_count: threatData.otx.pulse_count,
      is_malicious: threatData.otx.is_malicious,
      tags: threatData.otx.tags?.slice(0, 5),
    };
  }

  // Pulsedive
  if (threatData.pulsedive && !threatData.pulsedive.error) {
    data.pulsedive = {
      risk: threatData.pulsedive.risk,
      is_malicious: threatData.pulsedive.is_malicious,
      threat_count: threatData.pulsedive.threats?.length || 0,
      feed_count: threatData.pulsedive.feeds?.length || 0,
    };
  }

  // IPinfo
  if (threatData.ipinfo && !threatData.ipinfo.error) {
    data.ipinfo = {
      country: threatData.ipinfo.country,
      city: threatData.ipinfo.city,
      region: threatData.ipinfo.region,
      org: threatData.ipinfo.org_name,
      asn: threatData.ipinfo.asn,
      hostname: threatData.ipinfo.hostname,
    };
  }

  // MultiRBL
  if (threatData.multirbl && !threatData.multirbl.error) {
    data.blacklists = {
      listed_count: threatData.multirbl.listedCount,
      total_checked: threatData.multirbl.totalChecked,
      lists: threatData.multirbl.lists
        ?.filter((l) => l.listed)
        .map((l) => l.name),
    };
  }

  // IPQS (handle insufficient credits gracefully)
  if (threatData.ipqualityscore) {
    if (threatData.ipqualityscore.raw?.success === false) {
      data.ipqs = { status: "insufficient_credits" };
    } else if (threatData.ipqualityscore.fraud_score !== undefined) {
      data.ipqs = {
        fraud_score: threatData.ipqualityscore.fraud_score,
        vpn: threatData.ipqualityscore.vpn,
        proxy: threatData.ipqualityscore.proxy,
        tor: threatData.ipqualityscore.tor,
      };
    }
  }

  // URL-specific data
  if (type === "url" || type === "domain") {
    if (threatData.urlscan && !threatData.urlscan.error) {
      data.urlscan = {
        malicious: threatData.urlscan.is_malicious,
        score: threatData.urlscan.score,
        domain: threatData.urlscan.page?.domain,
      };
    }
    if (threatData.urlhaus && !threatData.urlhaus.error) {
      data.urlhaus = {
        malicious: threatData.urlhaus.is_malicious,
        url_count: threatData.urlhaus.count,
        tags: threatData.urlhaus.tags?.slice(0, 5),
      };
    }
    if (threatData.sucuri && !threatData.sucuri.error) {
      data.sucuri = {
        malicious: threatData.sucuri.is_malicious,
        blacklist_count: threatData.sucuri.blacklisted_by?.length || 0,
      };
    }
  }

  return data;
}

function buildPrompt(threatData, extractedData) {
  const type = threatData.type || "ip";
  const hasData = Object.keys(extractedData).length > 2; // more than just type and input

  // If no meaningful data, ask AI to analyze what it can
  if (!hasData) {
    return `
You are a senior threat intelligence analyst. The indicator "${threatData.input}" (type: ${type}) was queried but returned no threat intelligence data from any source.

**Possible reasons**:
- The indicator may be new or not previously seen
- API rate limits or authentication issues
- The indicator type may not be supported by available sources

**Task**: Based on your cybersecurity expertise alone (since no external data is available), provide a conservative risk assessment.

Return ONLY valid JSON:
{
  "riskScore": number (0-30, since no data available),
  "riskLevel": "LOW",
  "executiveSummary": "Brief explanation that no threat data was found",
  "riskAssessment": "Explanation of why risk is unknown/low",
  "keyIndicators": ["No threat intelligence data available from any source"],
  "potentialThreats": ["Unknown - insufficient data"],
  "recommendations": ["Monitor this indicator manually", "Re-query after 24 hours", "Check local logs for activity"],
  "confidenceLevel": "LOW",
  "sourcesContributingMost": ["None - no data returned"],
  "tacticalAdvice": "Treat as unknown and monitor for 48 hours before blocking"
}`;
  }

  // Build detailed prompt with available data
  return `
You are a world-class senior cybersecurity threat intelligence analyst with 15+ years of experience in SOC, DFIR, and threat hunting.

**Indicator**: ${threatData.input} (${type})

**Available Threat Intelligence**:
${JSON.stringify(extractedData, null, 2)}

**Analysis Instructions**:
1. Analyze the available data critically - if a source returned no data or errors, treat it as "no information" not "clean"
2. Focus on CONFIRMED malicious indicators over the absence of data
3. Consider the reputation and reliability of each source
4. Evaluate the totality of evidence, not individual signals in isolation

**Risk Assessment Guidelines**:
- 0-19 (LOW): No malicious indicators, appears to be legitimate infrastructure
- 20-39 (LOW-MEDIUM): Suspicious signals but no confirmed malicious activity
- 40-59 (MEDIUM): One confirmed malicious source or multiple suspicious signals
- 60-79 (HIGH): Multiple confirmed malicious sources or active scanning/attack patterns  
- 80-100 (CRITICAL): Active C2 infrastructure, malware distribution, or coordinated attack campaigns

**Scoring Weights** (use as guidance):
- GreyNoise "malicious" classification: +30-35 points
- AbuseIPDB 75-100% confidence: +20-30 points
- VirusTotal malicious detections (1-5: +10, 6-10: +20, 10+: +30)
- Multi-RBL listing: +10-15 points
- OTX pulses (1-5: +5, 5-10: +10, 10+: +15)
- URLhaus/Sucuri detection: +15-25 points

**Important**: 
- Some sources may have failed (API errors, rate limits) - treat these as "no data" not "clean"
- Base your assessment ONLY on data that successfully returned
- If no data is available from any source, assign LOW risk with appropriate explanation

Return ONLY valid JSON (no markdown, no extra text):
{
  "riskScore": number,
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "executiveSummary": "One powerful paragraph (2-3 sentences) summarizing the threat",
  "riskAssessment": "Detailed explanation of the key risk drivers based on available evidence",
  "keyIndicators": ["Most impactful indicator 1", "Indicator 2", "... (max 5)"],
  "potentialThreats": ["Specific realistic threat 1", "Threat 2", "... (max 4)"],
  "recommendations": ["Immediate action 1", "Action 2", "... (max 5, prioritized)"],
  "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
  "sourcesContributingMost": ["Source 1", "Source 2", "Source 3"],
  "tacticalAdvice": "One decisive sentence with the most important immediate action"
}`;
}

async function generateThreatSummaryAndRisk(threatData) {
  if (!threatData?.input) {
    throw new Error("Invalid threat data");
  }

  // Extract and clean relevant data for the prompt
  const extractedData = extractRelevantData(threatData);
  const prompt = buildPrompt(threatData, extractedData);

  // Log what data we're sending (for debugging)
  console.log(`[Gemini] Analyzing ${threatData.input} (${threatData.type})`);
  console.log(
    `[Gemini] Data sources available: ${
      Object.keys(extractedData)
        .filter((k) => k !== "type" && k !== "input")
        .join(", ") || "none"
    }`,
  );

  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        let text = response.text.trim();
        // Clean markdown code blocks
        text = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        const result = JSON.parse(text);

        // Validate required fields
        if (typeof result.riskScore !== "number") {
          throw new Error("Missing riskScore in response");
        }
        if (
          !result.riskLevel ||
          !["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(result.riskLevel)
        ) {
          throw new Error("Invalid riskLevel in response");
        }

        // Ensure risk score is within bounds
        result.riskScore = Math.min(100, Math.max(0, result.riskScore));

        console.log(
          `[Gemini] ✓ Success with ${model} | Risk: ${result.riskScore} (${result.riskLevel})`,
        );

        return {
          success: true,
          summary: {
            executiveSummary: result.executiveSummary,
            riskAssessment: result.riskAssessment,
            keyIndicators: result.keyIndicators || ["Analysis completed"],
            potentialThreats: result.potentialThreats || ["Insufficient data"],
            recommendations: result.recommendations || [
              "Monitor and re-analyze",
            ],
            confidenceLevel: result.confidenceLevel || "MEDIUM",
            sourcesContributingMost: result.sourcesContributingMost || [
              "Analysis based on available data",
            ],
            tacticalAdvice:
              result.tacticalAdvice || "Continue monitoring for new indicators",
          },
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          modelUsed: model,
          generatedAt: new Date().toISOString(),
        };
      } catch (err) {
        const msg = err.message || JSON.stringify(err);
        console.warn(
          `[Gemini] ${model} attempt ${attempt} failed: ${msg.substring(0, 200)}`,
        );

        // Don't retry on parse errors, just try next model
        if (msg.includes("503") || msg.includes("429")) {
          await sleep(attempt * 2000);
        }
      }
    }
  }

  // Fallback response when all models fail
  console.error(`[Gemini] All models failed for ${threatData.input}`);
  return {
    success: false,
    error: "Gemini API unavailable after retries",
    fallbackRisk: {
      riskScore: 0,
      riskLevel: "LOW",
      summary: {
        executiveSummary: `Unable to analyze ${threatData.input} due to AI service unavailability.`,
        riskAssessment: "Risk assessment could not be performed at this time.",
        keyIndicators: ["AI service temporarily unavailable"],
        potentialThreats: ["Unknown - analysis failed"],
        recommendations: [
          "Try again in a few minutes",
          "Check API key validity",
          "Verify network connectivity",
        ],
        confidenceLevel: "LOW",
        sourcesContributingMost: [],
        tacticalAdvice: "Re-query when AI service is available",
      },
    },
  };
}

module.exports = { generateThreatSummaryAndRisk };
