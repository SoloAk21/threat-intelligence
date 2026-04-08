// src/utils/riskCalculator.js (updated)
function calculateRiskScore(results) {
  let score = 0;
  const { analysisType } = results;

  // Common checks for all types
  if (results.vt?.last_analysis_stats?.malicious) {
    score += results.vt.last_analysis_stats.malicious * 3.5;
  }

  if (results.otx?.pulse_count) {
    score += Math.min(results.otx.pulse_count * 12, 95);
  }

  if (results.threatfox?.ioc_count > 0 || results.threatfox?.is_malicious) {
    score += 70;
  }

  if (
    results.pulsedive?.risk === "high" ||
    results.pulsedive?.risk === "critical"
  ) {
    score += 80;
  } else if (results.pulsedive?.risk === "medium") {
    score += 40;
  }

  if (results.threatminer?.detections > 0) {
    score += 45;
  }

  if (results.malwareurl?.is_malicious) {
    score += 55;
  }

  if (results.iocone?.is_malicious) {
    score += 30;
  }

  // IP-specific checks
  if (analysisType === "ip") {
    if (results.abuseipdb?.abuseConfidenceScore) {
      score += results.abuseipdb.abuseConfidenceScore * 0.35;
    }
    if (results.greynoise?.classification === "malicious") {
      score += 85;
    }
    if (results.ipqualityscore?.vpn || results.ipqualityscore?.proxy) {
      score += 75;
    }
    if (results.vpnapi?.security?.vpn || results.vpnapi?.security?.proxy) {
      score += 70;
    }
    if (results.shodan?.cves?.length > 0) {
      score += 90;
    }
    if (results.talos?.blacklisted) {
      score += 75;
    }
    if (results.multirbl?.is_blacklisted) {
      score += 60;
    }
    if (results.inquest?.is_malicious) {
      score += 65;
    }
  }

  // URL-specific checks
  if (analysisType === "url") {
    if (results.urlscan?.is_malicious) {
      score += 85;
    } else if (results.urlscan?.score > 50) {
      score += results.urlscan.score * 0.8;
    }

    if (results.urlhaus?.is_malicious) {
      score += 80;
    }
  }

  // Domain-specific checks
  if (analysisType === "domain") {
    if (results.sucuri?.is_malicious) {
      score += 75;
    }
    if (results.sucuri?.blacklist?.malware) {
      score += 60;
    }
    if (results.sucuri?.blacklist?.phishing) {
      score += 50;
    }
  }

  return Math.min(Math.max(Math.round(score), 0), 100);
}

module.exports = { calculateRiskScore };
