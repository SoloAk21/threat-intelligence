// src/components/cards/BrowserLeaksCard.tsx
import { motion } from "framer-motion";
import {
  Globe,
  Shield,
  Wifi,
  Server,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Database,
  Activity,
  Smartphone,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type { ThreatData } from "@/types/threat";

interface BrowserLeaksCardProps {
  data: ThreatData;
}

export function BrowserLeaksCard({ data }: BrowserLeaksCardProps) {
  const [copiedIP, setCopiedIP] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = (text: string, type: "ip" | "json") => {
    navigator.clipboard.writeText(text);
    if (type === "ip") {
      setCopiedIP(true);
      setTimeout(() => setCopiedIP(false), 2000);
    } else {
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    }
  };

  const getRiskColorClass = () => {
    if (data.riskScore >= 80) return "text-risk-critical";
    if (data.riskScore >= 60) return "text-risk-high";
    if (data.riskScore >= 40) return "text-risk-medium";
    return "text-risk-low";
  };

  const getRiskBgClass = () => {
    if (data.riskScore >= 80)
      return "bg-risk-critical/15 border-risk-critical/40";
    if (data.riskScore >= 60) return "bg-risk-high/15 border-risk-high/40";
    if (data.riskScore >= 40) return "bg-risk-medium/15 border-risk-medium/40";
    return "bg-risk-low/15 border-risk-low/40";
  };

  const getRiskBarClass = () => {
    if (data.riskScore >= 80) return "bg-risk-critical";
    if (data.riskScore >= 60) return "bg-risk-high";
    if (data.riskScore >= 40) return "bg-risk-medium";
    return "bg-risk-low";
  };

  const getRiskLevel = () => {
    if (data.riskScore >= 80) return "Critical";
    if (data.riskScore >= 60) return "High";
    if (data.riskScore >= 40) return "Medium";
    return "Low";
  };

  return (
    <div className="bg-surface-0 border-l-4 border-brand-primary shadow-md">
      {/* Header Button - Collapsible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="group w-full px-4 py-3 border-b border-border flex items-center gap-3 bg-gradient-to-r from-brand-primary/5 via-surface-1 to-surface-1 hover:from-brand-primary/10 hover:via-surface-2 hover:to-surface-2 transition-all duration-200 cursor-pointer text-left"
      >
        <div className="flex items-center justify-center w-7 h-7 bg-brand-primary/15 border border-brand-primary/30">
          <Globe className="h-3.5 w-3.5 text-brand-primary" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-wide text-foreground uppercase">
            BrowserLeaks
          </span>
          <span className="text-[9px] font-mono text-brand-primary-dark bg-brand-primary/10 px-1.5 py-0.5 border border-brand-primary/20">
            IP & Browser Test
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 w-20 bg-muted/30">
              <div
                className={`h-full ${getRiskBarClass()} transition-all duration-300`}
                style={{ width: `${data.riskScore}%` }}
              />
            </div>
            <span
              className={`text-[10px] font-bold tabular-nums ${getRiskColorClass()}`}
            >
              {data.riskScore}%
            </span>
          </div>
          <span
            className={`text-[9px] font-bold px-2 py-0.5 border ${getRiskBgClass()} ${getRiskColorClass()} uppercase tracking-wide`}
          >
            {getRiskLevel()}
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-brand-primary/50 group-hover:text-brand-primary transition-colors" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-brand-primary/50 group-hover:text-brand-primary transition-colors" />
          )}
        </div>
      </button>

      {/* Collapsed Summary View */}
      {!expanded && (
        <div className="px-4 py-2.5 flex items-center justify-between text-[10px] bg-brand-primary/5 border-b border-brand-primary/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-brand-primary/60" />
              <span className="text-muted-foreground">IP:</span>
              <span className="text-foreground/80 font-mono">{data.input}</span>
            </div>
            {data.ipinfo?.hostname && (
              <div className="flex items-center gap-1.5">
                <Server className="h-3 w-3 text-brand-primary/60" />
                <span className="text-muted-foreground truncate max-w-[200px]">
                  {data.ipinfo.hostname}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {data.ipinfo?.country && (
              <span className="text-muted-foreground font-mono text-[11px] flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5 text-brand-primary/50" />
                {data.ipinfo.country}
              </span>
            )}
            <span className="text-muted-foreground/50 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {new Date(data.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Expanded Detailed View */}
      {expanded && (
        <div className="p-4 space-y-4 bg-surface-0">
          {/* Brand Header Section */}
          <div className="bg-gradient-to-r from-brand-primary/5 to-transparent p-3 border-l-4 border-brand-primary">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-brand-primary" />
              <span className="text-[10px] font-bold text-brand-primary-dark uppercase tracking-wider">
                IP & Browser Leak Test
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Comprehensive analysis of IP address, geolocation, network, and
              threat intelligence
            </p>
          </div>

          {/* IP Address Section */}
          <div className="space-y-2 p-3 bg-surface-1 border border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-brand-primary" />
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Your IP Address
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(data.input, "ip")}
                className="p-1 hover:bg-brand-primary/10 transition-colors border border-border/30"
              >
                {copiedIP ? (
                  <Check className="h-3.5 w-3.5 text-risk-low" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-brand-primary/60" />
                )}
              </button>
            </div>
            <div className="p-3 bg-brand-primary/5 border border-brand-primary/20 text-center">
              <div className="text-2xl font-bold text-foreground font-mono">
                {data.input}
              </div>
              {data.ipinfo?.hostname && (
                <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                  {data.ipinfo.hostname}
                </div>
              )}
            </div>
          </div>

          {/* Risk Assessment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-brand-primary/10 border border-brand-primary/20">
            <div className="px-3 py-2 bg-surface-1 text-center">
              <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                Risk Score
              </div>
              <div className="text-xl font-bold tabular-nums text-foreground mt-0.5">
                {data.riskScore}%
              </div>
              <div className="mt-2 h-1.5 bg-muted/30">
                <div
                  className={`h-full ${getRiskBarClass()}`}
                  style={{ width: `${data.riskScore}%` }}
                />
              </div>
            </div>
            <div className="px-3 py-2 bg-surface-1 text-center">
              <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                Risk Level
              </div>
              <div
                className={`text-xl font-bold mt-0.5 ${getRiskColorClass()}`}
              >
                {getRiskLevel()}
              </div>
            </div>
            <div className="px-3 py-2 bg-surface-1 text-center">
              <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                Input Type
              </div>
              <div className="text-xl font-bold text-foreground mt-0.5 font-mono">
                {data.inputType?.toUpperCase() || "IP"}
              </div>
            </div>
          </div>

          {/* Geolocation Section */}
          {data.ipinfo && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-brand-primary/5 border-l-4 border-brand-primary">
                <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Geolocation
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-brand-primary/10 border border-brand-primary/20">
                <div className="px-3 py-2 bg-surface-1">
                  <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                    Country
                  </div>
                  <div className="text-sm font-medium text-foreground mt-0.5">
                    {data.ipinfo.country || "N/A"}
                  </div>
                </div>
                <div className="px-3 py-2 bg-surface-1">
                  <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                    Region
                  </div>
                  <div className="text-sm font-medium text-foreground mt-0.5">
                    {data.ipinfo.region || "N/A"}
                  </div>
                </div>
                <div className="px-3 py-2 bg-surface-1">
                  <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                    City
                  </div>
                  <div className="text-sm font-medium text-foreground mt-0.5">
                    {data.ipinfo.city || "N/A"}
                  </div>
                </div>
                <div className="px-3 py-2 bg-surface-1">
                  <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                    Postal
                  </div>
                  <div className="text-sm font-medium text-foreground mt-0.5">
                    {data.ipinfo.postal || "N/A"}
                  </div>
                </div>
                <div className="px-3 py-2 bg-surface-1 col-span-2">
                  <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                    Coordinates
                  </div>
                  <div className="text-sm font-mono text-foreground mt-0.5">
                    {data.ipinfo.loc || "N/A"}
                  </div>
                </div>
                <div className="px-3 py-2 bg-surface-1 col-span-2">
                  <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                    Timezone
                  </div>
                  <div className="text-sm font-medium text-foreground mt-0.5">
                    {data.ipinfo.timezone || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Network Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-brand-primary/5 border-l-4 border-brand-primary">
              <Server className="h-3.5 w-3.5 text-brand-primary" />
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                Network Information
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-brand-primary/10 border border-brand-primary/20">
              <div className="px-3 py-2 bg-surface-1">
                <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                  ISP / Organization
                </div>
                <div className="text-sm font-medium text-foreground mt-0.5">
                  {data.ipinfo?.org || "N/A"}
                </div>
              </div>
              <div className="px-3 py-2 bg-surface-1">
                <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                  ASN
                </div>
                <div className="text-sm font-mono text-foreground mt-0.5">
                  {data.vt?.asn ? `AS${data.vt.asn}` : "N/A"}
                </div>
              </div>
              <div className="px-3 py-2 bg-surface-1">
                <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                  AS Owner
                </div>
                <div className="text-sm font-medium text-foreground mt-0.5">
                  {data.vt?.as_owner || "N/A"}
                </div>
              </div>
              <div className="px-3 py-2 bg-surface-1">
                <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                  Network Range
                </div>
                <div className="text-sm font-mono text-foreground mt-0.5">
                  {data.vt?.network || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Security & Privacy Indicators */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-brand-secondary/5 border-l-4 border-brand-secondary">
              <Shield className="h-3.5 w-3.5 text-brand-secondary" />
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                Security & Privacy
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-brand-primary/10 border border-brand-primary/20">
              <div className="px-3 py-2 bg-surface-1 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">VPN</span>
                <span
                  className={`text-[10px] font-bold ${data.vpnapi?.security?.vpn ? "text-risk-critical" : "text-risk-low"}`}
                >
                  {data.vpnapi?.security?.vpn ? "Detected" : "Clean"}
                </span>
              </div>
              <div className="px-3 py-2 bg-surface-1 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Proxy</span>
                <span
                  className={`text-[10px] font-bold ${data.vpnapi?.security?.proxy ? "text-risk-critical" : "text-risk-low"}`}
                >
                  {data.vpnapi?.security?.proxy ? "Detected" : "Clean"}
                </span>
              </div>
              <div className="px-3 py-2 bg-surface-1 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">TOR</span>
                <span
                  className={`text-[10px] font-bold ${data.vpnapi?.security?.tor ? "text-risk-critical" : "text-risk-low"}`}
                >
                  {data.vpnapi?.security?.tor ? "Detected" : "Clean"}
                </span>
              </div>
              <div className="px-3 py-2 bg-surface-1 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Hosting
                </span>
                <span
                  className={`text-[10px] font-bold ${data.ipinfo?.is_hosting ? "text-risk-high" : "text-risk-low"}`}
                >
                  {data.ipinfo?.is_hosting ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Threat Intelligence Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-brand-primary/5 border-l-4 border-brand-primary">
              <Database className="h-3.5 w-3.5 text-brand-primary" />
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                Threat Intelligence
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-brand-primary/10 border border-brand-primary/20">
              <div className="px-3 py-2 bg-surface-1 text-center">
                <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                  VirusTotal
                </div>
                <div className="text-lg font-bold text-risk-critical mt-0.5">
                  {data.vt?.last_analysis_stats?.malicious || 0}
                </div>
                <div className="text-[8px] text-muted-foreground">
                  Malicious
                </div>
              </div>
              <div className="px-3 py-2 bg-surface-1 text-center">
                <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                  AbuseIPDB
                </div>
                <div
                  className={`text-lg font-bold mt-0.5 ${getRiskColorClass()}`}
                >
                  {data.abuseipdb?.abuseConfidenceScore || 0}%
                </div>
                <div className="text-[8px] text-muted-foreground">
                  Confidence
                </div>
              </div>
              <div className="px-3 py-2 bg-surface-1 text-center">
                <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                  Abuse Reports
                </div>
                <div className="text-lg font-bold text-foreground mt-0.5">
                  {data.abuseipdb?.totalReports || 0}
                </div>
                <div className="text-[8px] text-muted-foreground">Total</div>
              </div>
              <div className="px-3 py-2 bg-surface-1 text-center">
                <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                  OTX Pulses
                </div>
                <div className="text-lg font-bold text-foreground mt-0.5">
                  {data.otx?.pulse_count || 0}
                </div>
                <div className="text-[8px] text-muted-foreground">
                  AlienVault
                </div>
              </div>
            </div>
          </div>

          {/* Blacklist Status */}
          {data.multirbl && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-brand-primary/5 border-l-4 border-brand-primary">
                <Activity className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Blacklist Status
                </span>
              </div>
              <div className="p-3 bg-surface-1 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground">
                    RBL Blacklists
                  </span>
                  <span
                    className={`text-[11px] font-bold ${data.multirbl.listedCount > 0 ? "text-risk-critical" : "text-risk-low"}`}
                  >
                    {data.multirbl.listedCount} / {data.multirbl.totalChecked}{" "}
                    Listed
                  </span>
                </div>
                <div className="space-y-1 max-h-[120px] overflow-y-auto custom-scrollbar">
                  {data.multirbl.lists?.map((list, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[10px] py-0.5"
                    >
                      <span className="text-muted-foreground font-mono">
                        {list.name}
                      </span>
                      {list.listed ? (
                        <span className="text-risk-critical flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Listed
                        </span>
                      ) : (
                        <span className="text-risk-low flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Clean
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center justify-between pt-2 border-t border-brand-primary/20">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last Analyzed
            </div>
            <div className="text-[10px] text-foreground font-mono">
              {new Date(data.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() =>
                window.open(
                  `https://browserleaks.com/ip/${data.input}`,
                  "_blank",
                )
              }
              className="flex-1 py-2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary-dark transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              TEST BROWSER LEAKS
            </button>
            <button
              onClick={() =>
                copyToClipboard(JSON.stringify(data, null, 2), "json")
              }
              className="flex-1 py-2 bg-brand-secondary text-gray-900 text-[10px] font-bold uppercase tracking-wider hover:bg-brand-secondary-dark transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              {copiedJSON ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy Report
            </button>
          </div>

          {/* Brand Footer */}
          <div className="text-center pt-2 border-t border-brand-primary/10">
            <span className="text-[8px] text-muted-foreground/60">
              Powered by{" "}
              <span className="text-brand-primary font-mono">BrowserLeaks</span>{" "}
              • IP & privacy leak detection
            </span>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--surface-2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--brand-primary);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--brand-primary-dark);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--brand-primary) var(--surface-2);
        }
      `}</style>
    </div>
  );
}
