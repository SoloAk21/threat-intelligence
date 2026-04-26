// src/utils/exportUtils.ts
import type { ThreatData } from "@/types/threat";

// Convert threat data to CSV
export function threatToCSV(data: ThreatData): string {
  const rows = [
    ["Field", "Value"],
    ["Input", data.input],
    ["Type", data.type || data.inputType || "unknown"],
    ["Risk Score", data.riskScore],
    ["Risk Level", data.riskLevel],
    ["Timestamp", new Date(data.timestamp).toLocaleString()],
    ["Analysis Duration", `${data.analysisDuration}ms`],
    ["", ""],
    ["AbuseIPDB Confidence", data.abuseipdb?.abuseConfidenceScore || "N/A"],
    ["AbuseIPDB Reports", data.abuseipdb?.totalReports || "N/A"],
    ["VirusTotal Malicious", data.vt?.last_analysis_stats?.malicious || "N/A"],
    [
      "VirusTotal Suspicious",
      data.vt?.last_analysis_stats?.suspicious || "N/A",
    ],
    ["OTX Pulses", data.otx?.pulse_count || "N/A"],
    ["GreyNoise Classification", data.greynoise?.classification || "N/A"],
    ["", ""],
    ["AI Executive Summary", data.aiSummary?.executiveSummary || "N/A"],
    ["AI Confidence", data.aiSummary?.confidenceLevel || "N/A"],
  ];

  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
}

// JSON export (already handled)
export function threatToJSON(data: ThreatData): string {
  return JSON.stringify(data, null, 2);
}

// PDF export placeholder
export async function threatToPDF(data: ThreatData): Promise<Blob> {
  // TODO: Implement full PDF generation
  // This is a placeholder template for testing
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Threat Analysis Report - ${data.input}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 40px;
          color: #1a1a2e;
        }
        .header {
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .risk-score {
          font-size: 48px;
          font-weight: bold;
        }
        .risk-critical { color: #ef4444; }
        .risk-high { color: #f97316; }
        .risk-medium { color: #eab308; }
        .risk-low { color: #22c55e; }
        .section {
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          margin-bottom: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        td {
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .label {
          color: #64748b;
          width: 200px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Threat Intelligence Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>
      
      <div class="section">
        <div class="section-title">Indicator Information</div>
        <table>
          <tr><td class="label">Indicator:</td><td><strong>${data.input}</strong></td></tr>
          <tr><td class="label">Type:</td><td>${data.type || data.inputType || "unknown"}</td></tr>
          <tr><td class="label">Risk Score:</td><td class="risk-${data.riskLevel?.toLowerCase()}">${data.riskScore}/100 (${data.riskLevel})</td></tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">AI Summary</div>
        <p><strong>Executive Summary:</strong> ${data.aiSummary?.executiveSummary || "N/A"}</p>
        ${data.aiSummary?.riskAssessment ? `<p><strong>Risk Assessment:</strong> ${data.aiSummary.riskAssessment}</p>` : ""}
        ${data.aiSummary?.tacticalAdvice ? `<p><strong>Tactical Advice:</strong> ${data.aiSummary.tacticalAdvice}</p>` : ""}
      </div>

      <div class="section">
        <div class="section-title">Threat Intelligence</div>
        <table>
          <tr><td class="label">AbuseIPDB Confidence:</td><td>${data.abuseipdb?.abuseConfidenceScore || "N/A"}%</td></tr>
          <tr><td class="label">Total Abuse Reports:</td><td>${data.abuseipdb?.totalReports || "N/A"}</td></tr>
          <tr><td class="label">VirusTotal Malicious:</td><td>${data.vt?.last_analysis_stats?.malicious || "N/A"}</td></tr>
          <tr><td class="label">VirusTotal Suspicious:</td><td>${data.vt?.last_analysis_stats?.suspicious || "N/A"}</td></tr>
          <tr><td class="label">OTX Pulses:</td><td>${data.otx?.pulse_count || "N/A"}</td></tr>
          <tr><td class="label">GreyNoise:</td><td>${data.greynoise?.classification || "N/A"}</td></tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Recommendations</div>
        <ul>
          ${data.aiSummary?.recommendations?.map((rec) => `<li>${rec}</li>`).join("") || "<li>No recommendations available</li>"}
        </ul>
      </div>

      <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8;">
        <p>ThreatScope Intelligence Report • ${new Date().toISOString().split("T")[0]}</p>
      </footer>
    </body>
    </html>
  `;

  // For testing, return a blob that can be downloaded as HTML
  // Replace with actual PDF generation library (jsPDF, puppeteer, etc.)
  return new Blob([html], { type: "text/html" });
}
