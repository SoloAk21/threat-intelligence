// src/utils/exportUtils.ts
import type { ThreatData } from "@/types/threat";
import jsPDF from "jspdf";

// Helper to load and convert image to base64
const loadImageAsBase64 = async (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
};

export function threatToJSON(data: ThreatData): string {
  return JSON.stringify(data, null, 2);
}

export function threatToCSV(data: ThreatData): string {
  const flattenObject = (obj: any, prefix = ""): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(result, flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
    return result;
  };

  const flat = flattenObject(data);
  const headers = Object.keys(flat);
  const values = headers.map((h) => JSON.stringify(flat[h] || ""));
  return [headers.join(","), values.join(",")].join("\n");
}

export async function threatToPDF(
  data: ThreatData,
  bgImagePath?: string,
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  });

  // Load background image if provided
  let bgImageBase64: string | null = null;
  if (bgImagePath) {
    try {
      bgImageBase64 = await loadImageAsBase64(bgImagePath);
    } catch (err) {
      console.warn("Failed to load background image:", err);
    }
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Brand Colors
  const colors = {
    primary: "#0cb7b7",
    primaryDark: "#0a9c9c",
    primaryLight: "#8fdfdf",
    secondary: "#ffd222",
    secondaryDark: "#e6bc1f",
    critical: "#dc2626",
    criticalLight: "#fee2e2",
    high: "#f97316",
    highLight: "#ffedd5",
    medium: "#0cb7b7",
    mediumLight: "#f0fdfa",
    low: "#22c55e",
    lowLight: "#f0fdf4",
    text: "#1e293b",
    textLight: "#64748b",
    textLighter: "#94a3b8",
    border: "#e2e8f0",
    background: "#ffffff",
    backgroundAlt: "#f8fafc",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",
  };

  // INCREASED TOP MARGIN FROM 15 TO 25mm
  let y = 25; // Changed from 20 to 25 for more top margin
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const pageHeightMM = pageHeight;

  const addBackground = () => {
    if (bgImageBase64) {
      try {
        pdf.addImage(bgImageBase64, "PNG", 0, 0, pageWidth, pageHeightMM);
      } catch (err) {
        console.warn("Failed to add background image:", err);
      }
    }
  };

  const addNewPage = () => {
    pdf.addPage();
    addBackground();
    y = 25; // Reset to increased margin on new pages
    addFooter(pdf.getNumberOfPages());
  };

  const checkPageBreak = (needed: number): boolean => {
    if (y + needed > pageHeightMM - margin) {
      addNewPage();
      return true;
    }
    return false;
  };

  const addLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color?: string,
    width?: number,
  ) => {
    pdf.setDrawColor(color || colors.border);
    pdf.setLineWidth(width || 0.3);
    pdf.line(x1, y1, x2, y2);
  };

  const addRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    color?: string,
    fill?: boolean,
    border?: boolean,
  ) => {
    if (fill && color) {
      pdf.setFillColor(color);
      pdf.rect(x, y, w, h, "F");
    }
    if (border !== false) {
      pdf.setDrawColor(colors.border);
      pdf.setLineWidth(0.2);
      pdf.rect(x, y, w, h);
    }
  };

  const addGradientBar = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
  ) => {
    for (let i = 0; i < w; i++) {
      pdf.setFillColor(color);
      pdf.rect(x + i, y, 1, h, "F");
    }
  };

  const addBadge = (
    text: string,
    x: number,
    y: number,
    color: string,
    bgColor: string,
  ) => {
    const w = pdf.getTextWidth(text) + 6;
    addRect(x, y, w, 5.5, bgColor, true);
    addRect(x, y, w, 5.5, color, false);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(color);
    pdf.text(text, x + 3, y + 4);
    return w;
  };

  const addFooter = (pageNum: number) => {
    const footerY = pageHeightMM - 10;
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLighter);
    pdf.text(
      `ThreatScope • Confidential Threat Intelligence Report • Page ${pageNum}`,
      margin + contentWidth / 2,
      footerY,
      { align: "center" },
    );
    pdf.text(
      new Date().toLocaleDateString(),
      margin + contentWidth - 20,
      footerY,
    );
  };

  // Risk calculations
  const riskScore = data.riskScore || 0;
  const riskLevel =
    data.riskLevel ||
    (riskScore >= 80
      ? "CRITICAL"
      : riskScore >= 60
        ? "HIGH"
        : riskScore >= 40
          ? "MEDIUM"
          : "LOW");
  const riskColor =
    riskLevel === "CRITICAL"
      ? colors.critical
      : riskLevel === "HIGH"
        ? colors.high
        : riskLevel === "MEDIUM"
          ? colors.medium
          : colors.low;
  const riskBg =
    riskLevel === "CRITICAL"
      ? colors.criticalLight
      : riskLevel === "HIGH"
        ? colors.highLight
        : riskLevel === "MEDIUM"
          ? colors.mediumLight
          : colors.lowLight;

  // Add background to first page
  addBackground();

  // ==================== COVER PAGE ====================
  // INCREASED COVER Y POSITION FOR MORE TOP MARGIN
  const coverY = 75; // Changed from 70 to 75

  // Decorative top bar - moved down slightly
  addGradientBar(margin, coverY - 38, contentWidth, 3, colors.primary);

  // Logo area
  pdf.setFontSize(48);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);

  pdf.setFontSize(22);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(colors.text);
  pdf.text("THREAT INTELLIGENCE", margin + contentWidth / 2, coverY, {
    align: "center",
  });

  pdf.setFontSize(36);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("REPORT", margin + contentWidth / 2, coverY + 12, {
    align: "center",
  });

  // Risk badge on cover
  addBadge(
    riskLevel,
    margin + contentWidth / 2 - 20,
    coverY + 38, // Adjusted for new position
    riskColor,
    riskBg,
  );

  // Report metadata
  y = coverY + 55; // Increased from 55 to 60
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(colors.textLight);
  pdf.text(
    `Report ID: ${data.analysisId || "N/A"}`,
    margin + contentWidth / 2,
    y,
    {
      align: "center",
    },
  );
  y += 6;
  pdf.text(
    `Generated: ${new Date(data.timestamp).toLocaleString()}`,
    margin + contentWidth / 2,
    y,
    { align: "center" },
  );
  y += 6;
  pdf.text(`Indicator: ${data.input}`, margin + contentWidth / 2, y, {
    align: "center",
  });
  y += 6;
  pdf.text(
    `Type: ${(data.type || data.inputType || "IP").toUpperCase()}`,
    margin + contentWidth / 2,
    y,
    { align: "center" },
  );

  // Risk score circle - moved down for better spacing
  const circleX = margin + contentWidth / 2;
  const circleY = y + 18;
  const radius = 25;

  pdf.setDrawColor(colors.border);
  pdf.setLineWidth(3);
  pdf.circle(circleX, circleY, radius, "S");
  pdf.setDrawColor(riskColor);
  pdf.setLineWidth(3);

  // Draw arc
  for (let i = 0; i <= riskScore; i++) {
    const angle = (i / 100) * Math.PI * 2 - Math.PI / 2;
    const x = circleX + Math.cos(angle) * radius;
    const yPoint = circleY + Math.sin(angle) * radius;
    if (i > 0) {
      const prevAngle = ((i - 1) / 100) * Math.PI * 2 - Math.PI / 2;
      const prevX = circleX + Math.cos(prevAngle) * radius;
      const prevY = circleY + Math.sin(prevAngle) * radius;
      pdf.line(prevX, prevY, x, yPoint);
    }
  }

  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(riskColor);
  pdf.text(`${riskScore}`, circleX, circleY + 4, { align: "center" });
  pdf.setFontSize(8);
  pdf.setTextColor(colors.textLight);
  pdf.text("RISK SCORE", circleX, circleY + 12, { align: "center" });

  // Footer on cover
  addFooter(1);

  // ==================== PAGE 2 - EXECUTIVE SUMMARY ====================
  addNewPage();

  // Header with gradient line
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Executive Summary", margin, y);
  y += 6; // Increased spacing after header
  addGradientBar(margin, y, 60, 2, colors.primary);
  y += 12; // Increased spacing

  // Metadata cards
  const metaCards = [
    { label: "INPUT", value: data.input, color: colors.primary },
    {
      label: "TYPE",
      value: (data.type || data.inputType || "IP").toUpperCase(),
      color: colors.secondary,
    },
    { label: "RISK LEVEL", value: riskLevel, color: riskColor },
    {
      label: "DURATION",
      value: `${data.analysisDuration || 0}ms`,
      color: colors.info,
    },
  ];

  metaCards.forEach((card, i) => {
    const x = margin + i * 45;
    addRect(x, y, 43, 18, colors.backgroundAlt, true);
    addRect(x, y, 43, 18, colors.border, false);

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.textLight);
    pdf.text(card.label, x + 21.5, y + 5, { align: "center" });

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(card.color);
    const valueText =
      card.value.length > 15 ? card.value.substring(0, 12) + "..." : card.value;
    pdf.text(valueText, x + 21.5, y + 14, { align: "center" });
  });

  y += 32; // Increased spacing

  // AI Executive Summary
  if (data.aiSummary?.executiveSummary) {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.text);
    pdf.text("AI Executive Summary", margin, y);
    y += 6; // Increased spacing
    addLine(margin, y, margin + 50, y, colors.primary, 0.5);
    y += 10; // Increased spacing

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLight);
    const summaryLines = pdf.splitTextToSize(
      data.aiSummary.executiveSummary,
      contentWidth,
    );
    checkPageBreak(summaryLines.length * 5 + 10); // Increased line height allowance
    pdf.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 10; // Increased spacing
  }

  // Risk Assessment Box
  if (data.aiSummary?.riskAssessment) {
    checkPageBreak(45); // Increased from 40
    addRect(margin, y, contentWidth, 38, riskBg, true); // Increased height from 35 to 38
    addRect(margin, y, 4, 38, riskColor, true); // Increased height from 35 to 38

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(riskColor);
    pdf.text("RISK ASSESSMENT", margin + 8, y + 6); // Adjusted position

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text);
    const assessmentText = data.aiSummary.riskAssessment.replace(/\n/g, " ");
    const assessmentLines = pdf.splitTextToSize(
      assessmentText,
      contentWidth - 10,
    );
    pdf.text(assessmentLines, margin + 8, y + 13); // Adjusted position
    y += 42; // Increased from 38
  }

  // ==================== PAGE 3 - THREAT METRICS ====================
  addNewPage();

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Threat Metrics Dashboard", margin, y);
  y += 6; // Increased spacing
  addGradientBar(margin, y, 80, 2, colors.primary);
  y += 15; // Increased spacing

  // Key metrics in a grid
  const metrics = [
    {
      label: "AbuseIPDB",
      value: `${data.abuseipdb?.abuseConfidenceScore || 0}%`,
      sub: `${data.abuseipdb?.totalReports || 0} reports`,
    },
    {
      label: "VirusTotal",
      value: `${data.vt?.last_analysis_stats?.malicious || 0}`,
      sub: "malicious detections",
    },
    {
      label: "OTX Pulses",
      value: `${data.otx?.pulse_count || 0}`,
      sub: "threat pulses",
    },
    {
      label: "GreyNoise",
      value: data.greynoise?.classification || "unknown",
      sub: data.greynoise?.noise ? "active scanner" : "inactive",
    },
    {
      label: "Multi-RBL",
      value: `${data.multirbl?.listedCount || 0}`,
      sub: `of ${data.multirbl?.totalChecked || 0} blacklists`,
    },
    {
      label: "Pulsedive",
      value: data.pulsedive?.risk || "none",
      sub: `score ${data.pulsedive?.score || 0}`,
    },
  ];

  metrics.forEach((metric, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = margin + col * 60;
    const yPos = y + row * 38; // Increased row height from 35 to 38

    addRect(x, yPos, 58, 34, colors.backgroundAlt, true); // Increased height from 32 to 34
    addRect(x, yPos, 58, 34, colors.border, false);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.textLight);
    pdf.text(metric.label, x + 4, yPos + 7); // Adjusted position

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.primary);
    pdf.text(metric.value, x + 4, yPos + 22); // Adjusted position

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLight);
    pdf.text(metric.sub, x + 4, yPos + 30); // Adjusted position
  });

  y += 82; // Increased from 75

  // Progress bar for AbuseIPDB confidence
  if (data.abuseipdb?.abuseConfidenceScore) {
    checkPageBreak(25); // Increased from 20
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.text);
    pdf.text("Threat Confidence Analysis", margin, y);
    y += 6; // Increased spacing
    addLine(margin, y, margin + 60, y, colors.primary, 0.5);
    y += 10; // Increased spacing

    const confidence = data.abuseipdb.abuseConfidenceScore;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLight);
    pdf.text("AbuseIPDB Confidence", margin, y);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(
      confidence >= 75
        ? colors.critical
        : confidence >= 50
          ? colors.high
          : colors.medium,
    );
    pdf.text(`${confidence}%`, margin + 60, y);
    y += 4; // Increased spacing
    addRect(margin, y, contentWidth, 4, colors.border, true);
    addRect(
      margin,
      y,
      (confidence / 100) * contentWidth,
      4,
      confidence >= 75
        ? colors.critical
        : confidence >= 50
          ? colors.high
          : colors.medium,
      true,
    );
    y += 12; // Increased spacing
  }

  // ==================== PAGE 4 - DETAILED INTEL ====================
  addNewPage();

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Detailed Threat Intelligence", margin, y);
  y += 6; // Increased spacing
  addGradientBar(margin, y, 90, 2, colors.primary);
  y += 15; // Increased spacing

  // VirusTotal details
  const vtStats =
    (data.vt?.last_analysis_stats as {
      malicious?: number;
      suspicious?: number;
      harmless?: number;
      undetected?: number;
    }) || {};

  const malicious = vtStats.malicious || 0;
  const suspicious = vtStats.suspicious || 0;
  const harmless = vtStats.harmless || 0;
  const undetected = vtStats.undetected || 0;
  const totalEngines = malicious + suspicious + harmless + undetected;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("VirusTotal Analysis", margin, y);
  y += 6; // Increased spacing
  addLine(margin, y, margin + 50, y, colors.primary, 0.5);
  y += 10; // Increased spacing

  const vtData: Array<[string, number, string]> = [
    ["Malicious", malicious, colors.critical],
    ["Suspicious", suspicious, colors.high],
    ["Harmless", harmless, colors.low],
    ["Undetected", undetected, colors.textLight],
  ];

  vtData.forEach(([label, count, color]) => {
    const percent =
      totalEngines > 0 ? (count / totalEngines) * contentWidth : 0;

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLight);
    pdf.text(label, margin, y);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(color);
    pdf.text(`${count}`, margin + 45, y);
    y += 4; // Increased spacing

    addRect(margin, y, contentWidth, 3, colors.border, true);
    if (percent > 0) {
      addRect(margin, y, percent, 3, color, true);
    }
    y += 8; // Increased spacing
  });

  y += 8; // Increased spacing

  // Malicious vendors
  const maliciousVendors = Object.entries(data.vt?.last_analysis_results || {})
    .filter(([_, v]: [string, any]) => v?.category === "malicious")
    .map(([k]) => k);

  if (maliciousVendors.length > 0) {
    checkPageBreak(25); // Increased from 20
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.critical);
    pdf.text("Detected by:", margin, y);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text);
    const vendors = maliciousVendors.slice(0, 8).join(", ");
    const vendorLines = pdf.splitTextToSize(vendors, contentWidth - 40);
    pdf.text(vendorLines, margin + 25, y);
    y += vendorLines.length * 5 + 10; // Increased spacing
  }

  // ==================== PAGE 5 - ABUSEIPDB DETAILS ====================
  addNewPage();

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("AbuseIPDB Intelligence", margin, y);
  y += 6; // Increased spacing
  addLine(margin, y, margin + 60, y, colors.primary, 0.5);
  y += 12; // Increased spacing

  const abuseDetails: Array<[string, string]> = [
    ["Confidence Score", `${data.abuseipdb?.abuseConfidenceScore || 0}%`],
    ["Total Reports", `${data.abuseipdb?.totalReports || 0}`],
    ["Distinct Reporters", `${data.abuseipdb?.numDistinctUsers || 0}`],
    ["ISP", data.abuseipdb?.isp || "N/A"],
    ["Domain", data.abuseipdb?.domain || "N/A"],
    ["Usage Type", data.abuseipdb?.usageType || "N/A"],
    ["Country", data.abuseipdb?.countryName || "N/A"],
  ];

  abuseDetails.forEach(([label, value]) => {
    checkPageBreak(8); // Increased from 6
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.textLight);
    pdf.text(label, margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text);
    pdf.text(value, margin + 50, y);
    y += 8; // Increased spacing
  });

  y += 8; // Increased spacing

  // Last reported
  if (data.abuseipdb?.lastReportedAt) {
    checkPageBreak(12); // Increased from 10
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(colors.textLight);
    pdf.text(
      `Last reported: ${new Date(data.abuseipdb.lastReportedAt).toLocaleString()}`,
      margin,
      y,
    );
    y += 8; // Increased spacing
  }

  // ==================== PAGE 6 - NETWORK & GEOLOCATION ====================
  addNewPage();

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Network & Geolocation", margin, y);
  y += 6; // Increased spacing
  addGradientBar(margin, y, 80, 2, colors.primary);
  y += 15; // Increased spacing

  // Location information
  if (data.ipinfo?.country || data.abuseipdb?.countryName) {
    addRect(margin, y, contentWidth, 50, colors.backgroundAlt, true); // Increased height from 45 to 50
    addRect(margin, y, 4, 50, colors.primary, true); // Increased height from 45 to 50

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.primary);
    pdf.text("Location Information", margin + 10, y + 8); // Adjusted position

    const locationItems: Array<[string, string]> = [
      ["Country", data.ipinfo?.country || data.abuseipdb?.countryName || "N/A"],
      ["City", data.ipinfo?.city || "N/A"],
      ["Region", data.ipinfo?.region || "N/A"],
      ["Timezone", data.ipinfo?.timezone || "N/A"],
    ];

    locationItems.forEach(([label, value], idx) => {
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(colors.textLight);
      pdf.text(label, margin + 10, y + 20 + idx * 8); // Adjusted spacing
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(colors.text);
      pdf.text(value, margin + 40, y + 20 + idx * 8);
    });

    y += 60; // Increased from 55
  }

  // Network information
  if (data.ipinfo?.org_name || data.vt?.as_owner) {
    checkPageBreak(75); // Increased from 70
    addRect(margin, y, contentWidth, 65, colors.backgroundAlt, true); // Increased height from 60 to 65
    addRect(margin, y, 4, 65, colors.secondary, true); // Increased height from 60 to 65

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.secondary);
    pdf.text("Network Information", margin + 10, y + 8); // Adjusted position

    const networkItems: Array<[string, string]> = [
      ["ISP", data.ipinfo?.org_name || data.abuseipdb?.isp || "N/A"],
      [
        "ASN",
        data.ipinfo?.asn
          ? `AS${data.ipinfo.asn}`
          : data.vt?.asn
            ? `AS${data.vt.asn}`
            : "N/A",
      ],
      ["AS Owner", data.vt?.as_owner || "N/A"],
      ["Network Range", data.vt?.network || "N/A"],
    ];

    networkItems.forEach(([label, value], idx) => {
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(colors.textLight);
      pdf.text(label, margin + 10, y + 20 + idx * 9); // Adjusted spacing
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(colors.text);
      const truncatedValue =
        value.length > 35 ? value.substring(0, 32) + "..." : value;
      pdf.text(truncatedValue, margin + 45, y + 20 + idx * 9); // Adjusted spacing
    });
    y += 75; // Increased from 70
  }

  // ==================== PAGE 7 - RECOMMENDATIONS ====================
  addNewPage();

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Recommendations & Actions", margin, y);
  y += 6; // Increased spacing
  addGradientBar(margin, y, 85, 2, colors.primary);
  y += 15; // Increased spacing

  if (data.aiSummary?.recommendations?.length) {
    data.aiSummary.recommendations.forEach((rec) => {
      checkPageBreak(10); // Increased from 8
      addRect(margin, y, 4, 7, colors.primary, true); // Increased height from 6 to 7
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(colors.text);
      const recLines = pdf.splitTextToSize(rec, contentWidth - 15);
      pdf.text(recLines, margin + 10, y + 5); // Adjusted position
      y += recLines.length * 5 + 8; // Increased spacing
    });
  }

  y += 12; // Increased spacing

  // Tactical advice box
  if (data.aiSummary?.tacticalAdvice) {
    checkPageBreak(35); // Increased from 30
    addRect(margin, y, contentWidth, 32, colors.warning + "20", true); // Increased height from 28 to 32
    addRect(margin, y, 4, 32, colors.warning, true); // Increased height from 28 to 32

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.warning);
    pdf.text("IMMEDIATE ACTION REQUIRED", margin + 10, y + 7); // Adjusted position

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text);
    const adviceLines = pdf.splitTextToSize(
      data.aiSummary.tacticalAdvice,
      contentWidth - 15,
    );
    pdf.text(adviceLines, margin + 10, y + 16); // Adjusted position
    y += 38; // Increased from 32
  }

  // ==================== PAGE 8 - SOURCES ====================
  addNewPage();

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Threat Intelligence Sources", margin, y);
  y += 6; // Increased spacing
  addGradientBar(margin, y, 90, 2, colors.primary);
  y += 15; // Increased spacing

  const sources = [
    "AbuseIPDB",
    "VirusTotal",
    "GreyNoise",
    "AlienVault OTX",
    "Pulsedive",
    "Multi-RBL",
    "IPinfo",
    "ThreatFox",
    "IPQualityScore",
    "Shodan",
    "Censys",
    "URLScan.io",
    "URLHaus",
    "Sucuri",
  ];

  sources.forEach((source, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x = margin + col * 45;
    const yPos = y + row * 10; // Increased spacing from 9 to 10

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLight);
    pdf.text("•", x, yPos);
    pdf.text(source, x + 3, yPos);
  });

  y += 55; // Increased from 50

  // AI model info
  if (data.aiSummaryMeta?.model) {
    checkPageBreak(25); // Increased from 20
    addRect(margin, y, contentWidth, 22, colors.backgroundAlt, true); // Increased height from 20 to 22
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.textLight);
    pdf.text("Analysis Engine", margin + 5, y + 7); // Adjusted position
    pdf.setTextColor(colors.primary);
    pdf.text(data.aiSummaryMeta.model, margin + 5, y + 15); // Adjusted position
    y += 28; // Increased from 25
  }

  // Confidence level
  if (data.aiSummary?.confidenceLevel) {
    const confidenceColors = {
      HIGH: colors.success,
      MEDIUM: colors.warning,
      LOW: colors.critical,
    };
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.textLight);
    pdf.text("Confidence Level:", margin, y);
    pdf.setFontSize(11);
    pdf.setTextColor(
      confidenceColors[
        data.aiSummary.confidenceLevel as keyof typeof confidenceColors
      ] || colors.primary,
    );
    pdf.text(data.aiSummary.confidenceLevel, margin + 42, y); // Adjusted position
  }

  // Final footer on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(i);
  }

  return pdf.output("blob");
}

// Export function with download trigger
export async function downloadPDF(
  data: ThreatData,
  filename?: string,
  bgImagePath?: string,
) {
  try {
    const blob = await threatToPDF(data, bgImagePath);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `threat-report-${data.input}-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
}
