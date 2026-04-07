function calculateRiskScore(results) {
  let score = 0;

  if (results.abuseipdb?.abuseConfidenceScore)
    score += results.abuseipdb.abuseConfidenceScore * 0.35;
  if (results.vt?.last_analysis_stats?.malicious)
    score += results.vt.last_analysis_stats.malicious * 3.5;
  if (results.otx?.pulse_count)
    score += Math.min(results.otx.pulse_count * 12, 95);
  if (results.threatfox?.ioc_count > 0) score += 70;
  if (
    results.pulsedive?.risk === "high" ||
    results.pulsedive?.risk === "critical"
  )
    score += 80;
  if (results.greynoise?.classification === "malicious") score += 85;
  if (results.ipqualityscore?.vpn || results.ipqualityscore?.proxy) score += 75;
  if (results.vpnapi?.vpn || results.vpnapi?.proxy) score += 70;
  if (results.shodan?.cves?.length > 0) score += 90;
  if (results.talos?.blacklisted) score += 75;
  if (results.multirbl?.is_blacklisted) score += 60;
  if (results.inquest?.is_malicious) score += 65;
  if (results.threatminer?.detections > 0) score += 45;
  if (results.malwareurl?.is_malicious) score += 55;
  if (results.ipify?.is_malicious) score += 50;

  return Math.min(Math.max(Math.round(score), 0), 100);
}

module.exports = { calculateRiskScore };
