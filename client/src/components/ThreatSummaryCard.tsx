// src/components/ThreatSummaryCard.tsx
import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  Target,
  Clock,
  Wifi,
  Eye,
  Download,
  ClipboardCopy,
  Check,
  ChevronDown,
  ChevronUp,
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
  const riskLevel =
    data.riskLevel ||
    (riskScore >= 80
      ? "CRITICAL"
      : riskScore >= 60
        ? "HIGH"
        : riskScore >= 40
          ? "MEDIUM"
          : "LOW");

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 60) return "text-orange-500";
    if (score >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  // Privacy indicators
  const isVPN =
    data.vpnapi?.security?.vpn ||
    data.ipteoh?.security?.vpn ||
    data.ipify?.proxy?.vpn ||
    false;

  const isProxy =
    data.vpnapi?.security?.proxy ||
    data.ipteoh?.security?.proxy ||
    data.ipify?.proxy?.proxy ||
    false;

  const isTor =
    data.vpnapi?.security?.tor ||
    data.ipteoh?.security?.tor ||
    data.ipify?.proxy?.tor ||
    false;

  const isNoise = (data.greynoise as GreyNoiseData)?.noise || false;

  // Location
  const countryCode =
    data.ipinfo?.country ||
    data.vpnapi?.location?.country_code ||
    data.vt?.country ||
    "XX";

  const countryName =
    data.vpnapi?.location?.country || data.ipinfo?.country || "Unknown";

  const city = data.ipinfo?.city || data.vpnapi?.location?.city || "N/A";
  const isp =
    data.ipinfo?.org_name ||
    data.vpnapi?.network?.autonomous_system_organization ||
    data.ipify?.isp ||
    "Unknown ISP";

  const handleCopy = () => {
    const text = `${data.input} | Risk: ${riskScore}/100 (${riskLevel}) | AbuseIPDB: ${data.abuseipdb?.abuseConfidenceScore || 0}% | VT Malicious: ${data.vt?.last_analysis_stats?.malicious || 0}`;
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
    a.download = `threat-analysis-${data.input}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.();
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <div>
            <div className="font-mono text-sm font-medium">{data.input}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              {data.inputType?.toUpperCase() || "IP"}
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
            className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
              riskLevel === "CRITICAL"
                ? "bg-red-500/10 text-red-500 border-red-500/30"
                : riskLevel === "HIGH"
                  ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
                  : riskLevel === "MEDIUM"
                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                    : "bg-green-500/10 text-green-500 border-green-500/30"
            }`}
          >
            {riskLevel}
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="px-4 py-2.5 flex items-center gap-4 text-xs border-b border-border bg-muted/30">
        {countryCode !== "XX" && (
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            style={{ width: "1.1em", height: "0.8em" }}
          />
        )}
        <span className="text-muted-foreground truncate">
          {city}, {countryName}
        </span>
        <span className="text-muted-foreground/40">•</span>
        <span className="truncate">{isp}</span>

        {(isVPN || isProxy || isTor || isNoise) && (
          <>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex gap-3 text-[10px]">
              {isVPN && <span className="text-orange-500">VPN</span>}
              {isProxy && <span className="text-yellow-500">Proxy</span>}
              {isTor && <span className="text-red-500">Tor</span>}
              {isNoise && <span className="text-orange-500">Scanner</span>}
            </div>
          </>
        )}
      </div>

      {/* AI Summary - The Star of the Show */}
      {data.aiSummary && (
        <div className="p-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              AI Threat Intelligence Summary
            </span>
          </div>

          <p className="text-sm leading-relaxed text-foreground/90 mb-3">
            {data.aiSummary.executiveSummary}
          </p>

          <div className="text-xs text-muted-foreground mb-2 font-medium">
            Recommendations
          </div>
          <ul className="text-xs space-y-1">
            {data.aiSummary.recommendations?.slice(0, 3).map((rec, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-500 mt-0.5">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full py-2 text-xs flex items-center justify-center gap-1.5 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
      >
        {showDetails ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        {showDetails ? "Hide Technical Details" : "Show Technical Details"}
      </button>

      {/* Technical Details (collapsed by default) */}
      {showDetails && (
        <div className="px-4 pb-4 text-xs space-y-3">
          {/* Add more sections as needed */}
          <div>
            <div className="font-medium mb-1">Key Signals</div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                AbuseIPDB:{" "}
                <span className="font-mono">
                  {data.abuseipdb?.abuseConfidenceScore || 0}%
                </span>{" "}
                ({data.abuseipdb?.totalReports || 0} reports)
              </div>
              <div>
                VT Malicious:{" "}
                <span className="font-mono">
                  {data.vt?.last_analysis_stats?.malicious || 0}
                </span>
              </div>
              <div>
                OTX Pulses:{" "}
                <span className="font-mono">{data.otx?.pulse_count || 0}</span>
              </div>
              <div>
                GreyNoise:{" "}
                <span className={isNoise ? "text-orange-500" : ""}>
                  {(data.greynoise as GreyNoiseData)?.classification ||
                    "unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex border-t border-border">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs hover:bg-muted/50 active:bg-muted transition-colors"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ClipboardCopy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy Summary"}
          </button>
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs hover:bg-muted/50 active:bg-muted transition-colors border-l border-border"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
        </div>
      )}
    </div>
  );
}
