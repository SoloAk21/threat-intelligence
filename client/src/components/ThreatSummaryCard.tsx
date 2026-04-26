import { useState } from "react";
import {
  Shield,
  Target,
  Download,
  ClipboardCopy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Eye,
} from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import type { ThreatData, GreyNoiseData } from "@/types/threat";

interface ThreatSummaryCardProps {
  data: ThreatData;
  showActions?: boolean;
  onExport?: () => void;
  onCopy?: () => void;
}

export function ThreatSummaryCard({
  data,
  showActions = true,
  onExport,
  onCopy,
}: ThreatSummaryCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const riskScore = data.riskScore || 0;
  const riskLevel = data.riskLevel;
  const riskCalculatedByAI =
    data.aiSummaryMeta?.riskCalculatedBy === "gemini-ai";
  const fallbackUsed = data.aiSummaryMeta?.fallbackUsed === true;

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 60) return "text-orange-500";
    if (score >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "HIGH":
        return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      default:
        return "bg-green-500/10 text-green-500 border-green-500/30";
    }
  };

  const abuseConfidence = data.abuseipdb?.abuseConfidenceScore || 0;
  const totalReports = data.abuseipdb?.totalReports || 0;
  const vtMalicious = data.vt?.last_analysis_stats?.malicious || 0;
  const vtSuspicious = data.vt?.last_analysis_stats?.suspicious || 0;
  const otxPulses = data.otx?.pulse_count || 0;

  const greynoise = data.greynoise as GreyNoiseData;
  const isNoise = greynoise?.noise || false;
  const greyNoiseClassification = greynoise?.classification || "unknown";
  const isRiot = greynoise?.riot || false;

  const isVPN = data.vpnapi?.security?.vpn || false;
  const isProxy = data.vpnapi?.security?.proxy || false;
  const isTor = data.vpnapi?.security?.tor || false;

  const countryCode =
    data.ipinfo?.country || data.abuseipdb?.countryCode || "XX";
  const countryName =
    data.ipinfo?.country || data.abuseipdb?.countryName || "Unknown";
  const city = data.ipinfo?.city || "N/A";
  const isp = data.ipinfo?.org_name || data.abuseipdb?.isp || "Unknown ISP";

  const ipqsError = data.ipqualityscore?.raw?.success === false;
  const ipqsMessage = data.ipqualityscore?.raw?.message || "";

  const handleCopy = () => {
    const summary = data.aiSummary?.executiveSummary || "No summary available";
    const text = `${data.input} | Risk: ${riskScore}/100 (${riskLevel}) | ${summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `threat-${data.input}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.();
  };

  // Format bullet points for riskAssessment
  const renderBulletPoints = (text: string) => {
    if (!text) return null;
    const points = text
      .split("\n")
      .filter((p) => p.trim().startsWith("•") || p.trim().startsWith("-"));
    if (points.length > 0) {
      return (
        <ul className="space-y-1">
          {points.slice(0, 3).map((point, i) => (
            <li key={i} className="flex gap-2 text-xs text-foreground/80">
              <span className="text-primary mt-0.5">•</span>
              <span>{point.replace(/^[•\-]\s*/, "")}</span>
            </li>
          ))}
        </ul>
      );
    }
    return <p className="text-xs text-foreground/80">{text}</p>;
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <div>
            <div className="font-mono text-sm font-medium">{data.input}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground uppercase">
                {data.type?.toUpperCase() ||
                  data.inputType?.toUpperCase() ||
                  "IP"}
              </span>
              {riskCalculatedByAI && (
                <span className="text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                  AI Scored
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div
              className={`text-2xl font-bold tabular-nums ${getRiskColor(riskScore)}`}
            >
              {riskScore}
            </div>
            <div className="text-[10px] text-muted-foreground -mt-1">/100</div>
          </div>
          <div
            className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getRiskBg(riskLevel)}`}
          >
            {riskLevel}
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-2 text-xs border-b border-border bg-muted/30">
        {countryCode !== "XX" && (
          <>
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{ width: "1.1em", height: "0.8em" }}
            />
            <span className="text-muted-foreground">
              {city !== "N/A" ? `${city}, ` : ""}
              {countryName}
            </span>
          </>
        )}
        {isp !== "Unknown ISP" && (
          <>
            <span className="text-muted-foreground/40">•</span>
            <span className="truncate">{isp}</span>
          </>
        )}
        {(isVPN || isProxy || isTor || isNoise || isRiot) && (
          <>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex gap-1.5">
              {isVPN && (
                <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded text-[9px]">
                  VPN
                </span>
              )}
              {isProxy && (
                <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-[9px]">
                  Proxy
                </span>
              )}
              {isTor && (
                <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded text-[9px]">
                  Tor
                </span>
              )}
              {isNoise && (
                <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded text-[9px]">
                  Scanner
                </span>
              )}
              {isRiot && (
                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[9px]">
                  RIOT
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* AI Summary */}
      {data.aiSummary && (
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase text-primary">
              Threat Summary
            </span>
            <span className="ml-auto text-[10px] px-2 py-0.5 bg-muted rounded-full">
              Gemini {data.aiSummaryMeta?.model?.split("-")[1] || "AI"}
            </span>
          </div>

          {/* Executive Summary */}
          <p className="text-sm leading-relaxed text-foreground/90 mb-3">
            {data.aiSummary.executiveSummary}
          </p>

          {/* Risk Assessment (Bullet Points) */}
          {data.aiSummary.riskAssessment && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-muted-foreground mb-1">
                Key Findings
              </div>
              {renderBulletPoints(data.aiSummary.riskAssessment)}
            </div>
          )}

          {/* Key Indicators */}
          {data.aiSummary.keyIndicators?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Indicators
              </div>
              <div className="flex flex-wrap gap-1">
                {data.aiSummary.keyIndicators.slice(0, 3).map((ind, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {data.aiSummary.recommendations?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Actions
              </div>
              <ul className="space-y-1">
                {data.aiSummary.recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <span className="text-primary">→</span>
                    <span className="text-foreground/80">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tactical Advice */}
          {data.aiSummary.tacticalAdvice && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-primary">
                {data.aiSummary.tacticalAdvice}
              </p>
            </div>
          )}

          {/* Fallback Warning */}
          {fallbackUsed && (
            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-center">
              <p className="text-[10px] text-yellow-600">
                ⚠️ AI service unavailable - using fallback scoring
              </p>
            </div>
          )}
        </div>
      )}

      {/* IPQS Warning */}
      {ipqsError && (
        <div className="px-4 py-2 bg-yellow-500/5 border-b border-yellow-500/20">
          <p className="text-[10px] text-yellow-600">⚠️ {ipqsMessage}</p>
        </div>
      )}

      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full py-2 text-xs flex items-center justify-center gap-1 hover:bg-muted/50 transition-colors text-muted-foreground"
      >
        {showDetails ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        {showDetails ? "Hide Details" : "Show Technical Details"}
      </button>

      {/* Technical Details */}
      {showDetails && (
        <div className="px-4 pb-4 pt-3 text-xs space-y-3 border-t border-border/50">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">AbuseIPDB:</span>
              <span
                className={`font-mono ${abuseConfidence >= 80 ? "text-red-500" : ""}`}
              >
                {abuseConfidence}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reports:</span>
              <span className="font-mono">{totalReports}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VT Malicious:</span>
              <span className="font-mono text-red-500">{vtMalicious}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VT Suspicious:</span>
              <span className="font-mono text-yellow-500">{vtSuspicious}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">OTX Pulses:</span>
              <span className="font-mono">{otxPulses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GreyNoise:</span>
              <span
                className={`font-mono ${greyNoiseClassification === "malicious" ? "text-red-500" : ""}`}
              >
                {greyNoiseClassification}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">RBL Listed:</span>
              <span
                className={`font-mono ${(data.multirbl?.listedCount || 0) > 0 ? "text-red-500" : "text-green-500"}`}
              >
                {data.multirbl?.listedCount || 0}/
                {data.multirbl?.totalChecked || 0}
              </span>
            </div>
          </div>

          {data.aiSummaryMeta?.model && (
            <div>
              <div className="font-medium text-muted-foreground mb-1">
                Model
              </div>
              <div className="text-[10px] font-mono">
                {data.aiSummaryMeta.model}
              </div>
            </div>
          )}

          {data.aiSummary?.sourcesContributingMost?.length > 0 && (
            <div>
              <div className="font-medium text-muted-foreground mb-1">
                Sources
              </div>
              <div className="flex flex-wrap gap-1">
                {data.aiSummary.sourcesContributingMost.map((source, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 bg-muted rounded text-[10px]"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex border-t border-border">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs hover:bg-muted/50"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ClipboardCopy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs hover:bg-muted/50 border-l border-border"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      )}
    </div>
  );
}
