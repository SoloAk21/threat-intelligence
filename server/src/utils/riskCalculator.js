// src/utils/riskCalculator.js
const calculateRiskScore = (data) => {
  let totalScore = 0;
  let weightSum = 0;

  const {
    vt,
    abuseipdb,
    otx,
    threatfox,
    pulsedive,
    greynoise,
    ipqualityscore,
    vpnapi,
    shodan,
    talos,
    multirbl,
    inquest,
    threatminer,
    malwareurl,
    ipify,
    urlscan,
    urlhaus,
    sucuri,
    analysisType,
  } = data;

  // VirusTotal (weight: 25)
  if (vt && vt.last_analysis_stats) {
    const malicious = vt.last_analysis_stats.malicious || 0;
    const suspicious = vt.last_analysis_stats.suspicious || 0;
    const score = Math.min(100, malicious * 15 + suspicious * 8);
    totalScore += score * 25;
    weightSum += 25;
  }

  // AbuseIPDB (weight: 20)
  if (abuseipdb && abuseipdb.abuseConfidenceScore) {
    const confidence = abuseipdb.abuseConfidenceScore || 0;
    const reportBonus = Math.min(20, (abuseipdb.totalReports || 0) / 50);
    const score = Math.min(100, confidence + reportBonus);
    totalScore += score * 20;
    weightSum += 20;
  }

  // AlienVault OTX (weight: 15)
  if (otx && otx.pulse_count !== undefined) {
    const pulseBonus = Math.min(60, (otx.pulse_count || 0) * 2);
    const malwareBonus = (otx.malware_families?.length || 0) * 10;
    const score = Math.min(100, pulseBonus + malwareBonus);
    totalScore += score * 15;
    weightSum += 15;
  }

  // ThreatFox (weight: 12)
  if (threatfox && threatfox.ioc_count !== undefined) {
    const countBonus = Math.min(80, (threatfox.ioc_count || 0) * 10);
    const confidenceBonus = (threatfox.confidence_level || 0) * 20;
    const score = Math.min(100, countBonus + confidenceBonus);
    totalScore += score * 12;
    weightSum += 12;
  }

  // Pulsedive (weight: 10)
  if (pulsedive && pulsedive.risk) {
    const riskMap = { critical: 100, high: 80, medium: 50, low: 20, none: 0 };
    const score = riskMap[pulsedive.risk.toLowerCase()] || 0;
    totalScore += score * 10;
    weightSum += 10;
  }

  // GreyNoise (weight: 8)
  if (greynoise && greynoise.classification) {
    let score = 0;
    if (greynoise.classification === "malicious") score = 90;
    else if (greynoise.classification === "noisy") score = 60;
    else if (greynoise.classification === "benign") score = 10;
    totalScore += score * 8;
    weightSum += 8;
  }

  // IPQualityScore (weight: 8)
  if (ipqualityscore && ipqualityscore.fraud_score !== undefined) {
    const score = ipqualityscore.fraud_score || 0;
    totalScore += score * 8;
    weightSum += 8;
  }

  // Multi-RBL (weight: 7)
  if (multirbl && multirbl.listedCount !== undefined) {
    const score = Math.min(100, ((multirbl.listedCount || 0) / 7) * 100);
    totalScore += score * 7;
    weightSum += 7;
  }

  // InQuest Labs (weight: 6)
  if (inquest && inquest.reputation_hits !== undefined) {
    const score = Math.min(100, (inquest.reputation_hits || 0) * 10);
    totalScore += score * 6;
    weightSum += 6;
  }

  // URLScan.io (for URLs)
  if (analysisType === "url" && urlscan && urlscan.is_malicious !== undefined) {
    const score = urlscan.is_malicious ? 80 : urlscan.score || 0;
    totalScore += score * 10;
    weightSum += 10;
  }

  // URLHaus (for URLs)
  if (analysisType === "url" && urlhaus && urlhaus.count !== undefined) {
    const score = Math.min(100, (urlhaus.count || 0) * 20);
    totalScore += score * 8;
    weightSum += 8;
  }

  // Sucuri (for domains/URLs)
  if (
    (analysisType === "domain" || analysisType === "url") &&
    sucuri &&
    sucuri.is_malicious !== undefined
  ) {
    const score = sucuri.is_malicious ? 85 : 15;
    totalScore += score * 8;
    weightSum += 8;
  }

  // VPNAPI (weight: 5)
  if (vpnapi && vpnapi.security) {
    let score = 0;
    if (vpnapi.security.vpn) score += 30;
    if (vpnapi.security.proxy) score += 30;
    if (vpnapi.security.tor) score += 40;
    totalScore += score * 5;
    weightSum += 5;
  }

  // Shodan (weight: 5)
  if (shodan && shodan.cves) {
    const cveBonus = Math.min(50, (shodan.cves.length || 0) * 10);
    const vulnBonus = (shodan.vulns?.length || 0) * 5;
    const score = Math.min(100, cveBonus + vulnBonus);
    totalScore += score * 5;
    weightSum += 5;
  }

  // Talos (weight: 4)
  if (talos && talos.blacklisted !== undefined) {
    const score = talos.blacklisted ? 70 : 10;
    totalScore += score * 4;
    weightSum += 4;
  }

  // Calculate final weighted average
  const finalScore = weightSum > 0 ? Math.round(totalScore / weightSum) : 0;

  // Apply modifiers based on additional factors
  let modifiedScore = finalScore;

  // Critical modifier: If any service reports critical threat
  if (vt?.last_analysis_stats?.malicious > 10) modifiedScore += 10;
  if (abuseipdb?.abuseConfidenceScore === 100) modifiedScore += 10;
  if (pulsedive?.risk === "critical") modifiedScore += 15;

  // Ensure score stays within 0-100 range
  return Math.min(100, Math.max(0, modifiedScore));
};

module.exports = { calculateRiskScore };
