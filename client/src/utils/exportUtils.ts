// src/utils/exportUtils.ts
import type { ThreatData } from "@/types/threat";
import jsPDF from "jspdf";

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

export async function threatToPDF(data: ThreatData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  });

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
    low: "#2dc5c5",
    lowLight: "#ecfdf5",
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

  let y = 20;
  const margin = 15;
  const contentWidth = 180;
  const pageHeight = 297;

  const addNewPage = () => {
    pdf.addPage();
    y = margin;
    addFooter(pdf.getNumberOfPages());
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      addNewPage();
      return true;
    }
    return false;
  };

  const addText = (
    text: string,
    x: number,
    fontSize: number,
    options?: any,
  ) => {
    pdf.setFontSize(fontSize);
    pdf.setFont(options?.font || "helvetica", options?.fontStyle || "normal");
    pdf.setTextColor(options?.color || colors.text);
    if (options?.align) {
      pdf.text(text, x, y, { align: options.align });
    } else {
      pdf.text(text, x, y);
    }
    return pdf.getTextWidth(text);
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
      const opacity = 1 - (i / w) * 0.5;
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
    const footerY = pageHeight - 10;
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

  // ==================== COVER PAGE ====================
  const coverY = 70;

  // Decorative top bar
  addGradientBar(margin, coverY - 35, contentWidth, 3, colors.primary);

  // Logo area
  pdf.setFontSize(48);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("TS", margin + contentWidth / 2, coverY - 15, { align: "center" });

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

  // Decorative line
  addLine(
    margin + 40,
    coverY + 22,
    margin + contentWidth - 40,
    coverY + 22,
    colors.primary,
    1,
  );

  // Risk badge on cover
  const badgeW = addBadge(
    riskLevel,
    margin + contentWidth / 2 - 20,
    coverY + 35,
    riskColor,
    riskBg,
  );

  // Report metadata
  y = coverY + 55;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(colors.textLight);
  pdf.text(
    `Report ID: ${data.analysisId || "N/A"}`,
    margin + contentWidth / 2,
    y,
    { align: "center" },
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

  // Risk score circle
  const circleX = margin + contentWidth / 2;
  const circleY = y + 25;
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const dashArray = (riskScore / 100) * circumference;

  pdf.setDrawColor(colors.border);
  pdf.setLineWidth(3);
  pdf.circle(circleX, circleY, radius, "S");
  pdf.setDrawColor(riskColor);
  pdf.setLineWidth(3);
  // Draw arc using lines for simplicity
  for (let i = 0; i <= riskScore; i++) {
    const angle = (i / 100) * Math.PI * 2 - Math.PI / 2;
    const x = circleX + Math.cos(angle) * radius;
    const yPoint = circleY + Math.sin(angle) * radius;
    if (i > 0) {
      const prevAngle = ((i - 1) / 100) * Math.PI * 2 - Math.PI / 2;
      const prevX = circleX + Math.cos(prevAngle) * radius;
      const prevY = circleY + Math.sin(prevAngle) * radius;
      pdf.setDrawColor(riskColor);
      pdf.setLineWidth(3);
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
  y += 5;
  addGradientBar(margin, y, 60, 2, colors.primary);
  y += 10;

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

  y += 28;

  // AI Executive Summary
  if (data.aiSummary?.executiveSummary) {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.text);
    pdf.text("AI Executive Summary", margin, y);
    y += 5;
    addLine(margin, y, margin + 50, y, colors.primary, 0.5);
    y += 8;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLight);
    const summaryLines = pdf.splitTextToSize(
      data.aiSummary.executiveSummary,
      contentWidth,
    );
    checkPageBreak(summaryLines.length * 4.5 + 10);
    pdf.text(summaryLines, margin, y);
    y += summaryLines.length * 4.5 + 8;
  }

  // Risk Assessment Box
  if (data.aiSummary?.riskAssessment) {
    checkPageBreak(40);
    addRect(margin, y, contentWidth, 35, riskBg, true);
    addRect(margin, y, 4, 35, riskColor, true);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(riskColor);
    pdf.text("RISK ASSESSMENT", margin + 8, y + 5);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text);
    const assessmentText = data.aiSummary.riskAssessment.replace(/\n/g, " ");
    const assessmentLines = pdf.splitTextToSize(
      assessmentText,
      contentWidth - 10,
    );
    pdf.text(assessmentLines, margin + 8, y + 12);
    y += 38;
  }

  // ==================== PAGE 3 - THREAT METRICS ====================
  addNewPage();

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Threat Metrics Dashboard", margin, y);
  y += 5;
  addGradientBar(margin, y, 80, 2, colors.primary);
  y += 12;

  // Key metrics in a grid
  const metrics = [
    {
      label: "AbuseIPDB",
      value: `${data.abuseipdb?.abuseConfidenceScore || 0}%`,
      sub: `${data.abuseipdb?.totalReports || 0} reports`,
      icon: "⚠",
    },
    {
      label: "VirusTotal",
      value: `${data.vt?.last_analysis_stats?.malicious || 0}`,
      sub: "malicious detections",
      icon: "🦠",
    },
    {
      label: "OTX Pulses",
      value: `${data.otx?.pulse_count || 0}`,
      sub: "threat pulses",
      icon: "📡",
    },
    {
      label: "GreyNoise",
      value: data.greynoise?.classification || "unknown",
      sub: data.greynoise?.noise ? "active scanner" : "inactive",
      icon: "🔊",
    },
    {
      label: "Multi-RBL",
      value: `${data.multirbl?.listedCount || 0}`,
      sub: `of ${data.multirbl?.totalChecked || 0} blacklists`,
      icon: "📋",
    },
    {
      label: "Pulsedive",
      value: data.pulsedive?.risk || "none",
      sub: `score ${data.pulsedive?.score || 0}`,
      icon: "⚡",
    },
  ];

  metrics.forEach((metric, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = margin + col * 60;
    const yPos = y + row * 35;

    addRect(x, yPos, 58, 32, colors.backgroundAlt, true);
    addRect(x, yPos, 58, 32, colors.border, false);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.textLight);
    pdf.text(metric.label, x + 4, yPos + 6);

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.primary);
    pdf.text(metric.value, x + 4, yPos + 20);

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLight);
    pdf.text(metric.sub, x + 4, yPos + 28);
  });

  y += 75;

  // Progress bars for key metrics
  if (data.abuseipdb?.abuseConfidenceScore) {
    checkPageBreak(20);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.text);
    pdf.text("Threat Confidence Analysis", margin, y);
    y += 5;
    addLine(margin, y, margin + 60, y, colors.primary, 0.5);
    y += 8;

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
    y += 3;
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
    y += 10;
  }

  // ==================== PAGE 4 - DETAILED INTEL ====================
  addNewPage();

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Detailed Threat Intelligence", margin, y);
  y += 5;
  addGradientBar(margin, y, 90, 2, colors.primary);
  y += 12;

  // VirusTotal details
  const vtStats = data.vt?.last_analysis_stats || {};
  //   const totalDetections = (vtStats.malicious || 0) + (vtStats.suspicious || 0);
  //   const totalEngines =
  //     (vtStats.malicious || 0) +
  //     (vtStats.suspicious || 0) +
  //     (vtStats.harmless || 0) +
  //     (vtStats.undetected || 0);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("VirusTotal Analysis", margin, y);
  y += 5;
  addLine(margin, y, margin + 50, y, colors.primary, 0.5);
  y += 8;

  const vtData = [
    ["Malicious", vtStats.malicious || 0, colors.critical],
    ["Suspicious", vtStats.suspicious || 0, colors.high],
    ["Harmless", vtStats.harmless || 0, colors.low],
    ["Undetected", vtStats.undetected || 0, colors.textLight],
  ];

  vtData.forEach(([label, value, color]) => {
    const percent =
      totalEngines > 0 ? (value / totalEngines) * contentWidth : 0;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLight);
    pdf.text(label as string, margin, y);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(color as string);
    pdf.text(`${value}`, margin + 45, y);
    y += 3;
    addRect(margin, y, contentWidth, 3, colors.border, true);
    addRect(margin, y, percent, 3, color as string, true);
    y += 6;
  });

  y += 5;

  // Malicious vendors
  const maliciousVendors = Object.entries(data.vt?.last_analysis_results || {})
    .filter(([_, v]: [string, any]) => v?.category === "malicious")
    .map(([k]) => k);

  if (maliciousVendors.length > 0) {
    checkPageBreak(20);
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
    y += vendorLines.length * 4 + 8;
  }

  // AbuseIPDB details
  addNewPage();

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("AbuseIPDB Intelligence", margin, y);
  y += 5;
  addLine(margin, y, margin + 60, y, colors.primary, 0.5);
  y += 8;

  const abuseDetails = [
    [
      "Confidence Score",
      `${data.abuseipdb?.abuseConfidenceScore || 0}%`,
      data.abuseipdb?.abuseConfidenceScore || 0,
    ],
    ["Total Reports", `${data.abuseipdb?.totalReports || 0}`, null],
    ["Distinct Reporters", `${data.abuseipdb?.numDistinctUsers || 0}`, null],
    ["ISP", data.abuseipdb?.isp || "N/A", null],
    ["Domain", data.abuseipdb?.domain || "N/A", null],
    ["Usage Type", data.abuseipdb?.usageType || "N/A", null],
    ["Country", data.abuseipdb?.countryName || "N/A", null],
  ];

  abuseDetails.forEach(([label, value, score]) => {
    checkPageBreak(6);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.textLight);
    pdf.text(label as string, margin, y);
    pdf.setFont("helvetica", "normal");
    if (score !== null && (score as number) >= 75) {
      pdf.setTextColor(colors.critical);
    } else if (score !== null && (score as number) >= 50) {
      pdf.setTextColor(colors.high);
    } else {
      pdf.setTextColor(colors.text);
    }
    pdf.text(value as string, margin + 50, y);
    y += 6;
  });

  y += 5;

  // Last reported
  if (data.abuseipdb?.lastReportedAt) {
    checkPageBreak(10);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(colors.textLight);
    pdf.text(
      `Last reported: ${new Date(data.abuseipdb.lastReportedAt).toLocaleString()}`,
      margin,
      y,
    );
    y += 6;
  }

  // ==================== PAGE 5 - NETWORK & GEOLOCATION ====================
  addNewPage();

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Network & Geolocation", margin, y);
  y += 5;
  addGradientBar(margin, y, 80, 2, colors.primary);
  y += 12;

  // Location card
  addRect(margin, y, contentWidth, 50, colors.backgroundAlt, true);
  addRect(margin, y, 4, 50, colors.primary, true);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Location Information", margin + 10, y + 6);

  const locationData = [
    ["Country", data.ipinfo?.country || data.abuseipdb?.countryName || "N/A"],
    ["City", data.ipinfo?.city || "N/A"],
    ["Region", data.ipinfo?.region || "N/A"],
    ["Coordinates", data.ipinfo?.loc || "N/A"],
    ["Timezone", data.ipinfo?.timezone || "N/A"],
  ];

  locationData.forEach(([label, value], i) => {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.textLight);
    pdf.text(label as string, margin + 10, y + 16 + i * 6);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text);
    pdf.text(value as string, margin + 35, y + 16 + i * 6);
  });

  // ISP and ASN
  const networkData = [
    [
      "ISP / Organization",
      data.ipinfo?.org_name || data.abuseipdb?.isp || "N/A",
    ],
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
    ["Hostname", data.ipinfo?.hostname || "N/A"],
    ["JARM Fingerprint", data.vt?.jarm || "N/A"],
  ];

  y += 65;
  addRect(margin, y, contentWidth, 75, colors.backgroundAlt, true);
  addRect(margin, y, 4, 75, colors.secondary, true);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.secondary);
  pdf.text("Network Information", margin + 10, y + 6);

  networkData.forEach(([label, value], i) => {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.textLight);
    pdf.text(label as string, margin + 10, y + 16 + i * 7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text);
    const truncatedValue =
      (value as string).length > 40
        ? (value as string).substring(0, 37) + "..."
        : value;
    pdf.text(truncatedValue as string, margin + 45, y + 16 + i * 7);
  });

  // ==================== PAGE 6 - SECURITY & PRIVACY ====================
  addNewPage();

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Security & Privacy Analysis", margin, y);
  y += 5;
  addGradientBar(margin, y, 85, 2, colors.primary);
  y += 12;

  const securityIndicators = [
    {
      label: "VPN Detection",
      value: data.vpnapi?.security?.vpn || false,
      color: colors.critical,
    },
    {
      label: "Proxy Detection",
      value: data.vpnapi?.security?.proxy || false,
      color: colors.high,
    },
    {
      label: "Tor Network",
      value: data.vpnapi?.security?.tor || false,
      color: colors.warning,
    },
    {
      label: "Hosting Provider",
      value: data.ipinfo?.privacy?.hosting || false,
      color: colors.info,
    },
    {
      label: "GreyNoise Scanner",
      value: data.greynoise?.noise || false,
      color: colors.high,
    },
    {
      label: "RIOT Verified",
      value: data.greynoise?.riot || false,
      color: colors.success,
    },
  ];

  securityIndicators.forEach((indicator, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = margin + col * 90;
    const yPos = y + row * 25;

    addRect(x, yPos, 88, 22, colors.backgroundAlt, true);
    addRect(x, yPos, 88, 22, colors.border, false);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.textLight);
    pdf.text(indicator.label, x + 5, yPos + 6);

    const statusText = indicator.value ? "DETECTED" : "CLEAN";
    const statusColor = indicator.value ? indicator.color : colors.success;

    addBadge(statusText, x + 65, yPos + 2, statusColor, statusColor + "10");

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(indicator.value ? indicator.color : colors.success);
    pdf.text(statusText, x + 70, yPos + 16);
  });

  y += 65;

  // IPQS if available
  if (data.ipqualityscore?.fraud_score !== undefined) {
    checkPageBreak(40);
    addRect(margin, y, contentWidth, 35, colors.backgroundAlt, true);
    addRect(margin, y, 4, 35, colors.info, true);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.info);
    pdf.text("IPQualityScore Analysis", margin + 10, y + 6);

    const ipqsScore = data.ipqualityscore.fraud_score;
    const ipqsColor =
      ipqsScore >= 75
        ? colors.critical
        : ipqsScore >= 50
          ? colors.high
          : ipqsScore >= 25
            ? colors.warning
            : colors.success;

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLight);
    pdf.text("Fraud Score", margin + 10, y + 16);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(ipqsColor);
    pdf.text(`${ipqsScore}/100`, margin + 45, y + 15);

    const ipqsDetails = [
      `VPN: ${data.ipqualityscore.vpn ? "Yes" : "No"}`,
      `Proxy: ${data.ipqualityscore.proxy ? "Yes" : "No"}`,
      `Tor: ${data.ipqualityscore.tor ? "Yes" : "No"}`,
      `Bot: ${data.ipqualityscore.bot_status ? "Yes" : "No"}`,
    ];

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLight);
    pdf.text(ipqsDetails.join(" • "), margin + 10, y + 26);
    y += 40;
  }

  // ==================== PAGE 7 - RECOMMENDATIONS ====================
  addNewPage();

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Recommendations & Actions", margin, y);
  y += 5;
  addGradientBar(margin, y, 85, 2, colors.primary);
  y += 12;

  if (data.aiSummary?.recommendations?.length) {
    data.aiSummary.recommendations.forEach((rec, i) => {
      checkPageBreak(8);
      addRect(margin, y, 4, 6, colors.primary, true);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(colors.text);
      const recLines = pdf.splitTextToSize(rec, contentWidth - 15);
      pdf.text(recLines, margin + 10, y + 4);
      y += recLines.length * 4 + 6;
    });
  }

  y += 10;

  // Tactical advice box
  if (data.aiSummary?.tacticalAdvice) {
    checkPageBreak(30);
    addRect(margin, y, contentWidth, 28, colors.warning + "10", true);
    addRect(margin, y, 4, 28, colors.warning, true);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.warning);
    pdf.text("IMMEDIATE ACTION REQUIRED", margin + 10, y + 6);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text);
    const adviceLines = pdf.splitTextToSize(
      data.aiSummary.tacticalAdvice,
      contentWidth - 15,
    );
    pdf.text(adviceLines, margin + 10, y + 14);
    y += 32;
  }

  // ==================== PAGE 8 - SOURCES & FOOTER ====================
  addNewPage();

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary);
  pdf.text("Threat Intelligence Sources", margin, y);
  y += 5;
  addGradientBar(margin, y, 90, 2, colors.primary);
  y += 12;

  const sources = [
    "AbuseIPDB",
    "VirusTotal",
    "GreyNoise",
    "AlienVault OTX",
    "Pulsedive",
    "Multi-RBL",
    "IPinfo",
    "InQuest RepDB",
    "ThreatFox",
    "IPQualityScore",
    "Shodan",
    "Censys",
    "Talos",
    "URLScan.io",
    "URLHaus",
    "Sucuri",
  ];

  sources.forEach((source, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x = margin + col * 45;
    const yPos = y + row * 10;

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.textLight);
    pdf.text("•", x, yPos);
    pdf.text(source, x + 3, yPos);
  });

  y += 60;

  // AI model info
  if (data.aiSummaryMeta?.model) {
    checkPageBreak(20);
    addRect(margin, y, contentWidth, 20, colors.backgroundAlt, true);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.textLight);
    pdf.text("Analysis Engine", margin + 5, y + 6);
    pdf.setTextColor(colors.primary);
    pdf.text(data.aiSummaryMeta.model, margin + 5, y + 13);
    y += 25;
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
    pdf.text(data.aiSummary.confidenceLevel, margin + 40, y);
    y += 10;
  }

  // Final footer on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(i);
  }

  return pdf.output("blob");
}
