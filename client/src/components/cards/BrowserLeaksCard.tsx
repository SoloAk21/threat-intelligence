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
} from "lucide-react";
import { useState } from "react";
import type { ThreatData } from "@/types/threat";

interface BrowserLeaksCardProps {
  data: ThreatData;
}

export function BrowserLeaksCard({ data }: BrowserLeaksCardProps) {
  const [copiedIP, setCopiedIP] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);

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

  const getRiskColor = () => {
    if (data.riskScore >= 80)
      return "text-red-500 bg-red-500/10 border-red-500/20";
    if (data.riskScore >= 60)
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    if (data.riskScore >= 40)
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-green-500 bg-green-500/10 border-green-500/20";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="p-5 border-b border-border/50 bg-gradient-to-r from-purple-500/5 to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Globe className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                BrowserLeaks
              </h3>
              <p className="text-xs text-muted-foreground">
                IP & Browser Leak Test
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${getRiskColor()}`}
          >
            Risk Score: {data.riskScore}/100
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* IP Address Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-semibold text-foreground">
                Your IP Address
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(data.input, "ip")}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              {copiedIP ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 text-center">
            <div className="text-2xl font-bold text-foreground font-mono">
              {data.input}
            </div>
            {data.ipinfo?.hostname && (
              <div className="text-xs text-muted-foreground mt-1">
                Hostname: {data.ipinfo.hostname}
              </div>
            )}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-purple-500" />
            Risk Assessment
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/20 text-center">
              <div className="text-2xl font-bold text-foreground">
                {data.riskScore}%
              </div>
              <div className="text-xs text-muted-foreground">Risk Score</div>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${data.riskScore}%` }}
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 text-center">
              <div className="text-2xl font-bold text-foreground">
                {data.riskLevel}
              </div>
              <div className="text-xs text-muted-foreground">Risk Level</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 text-center">
              <div className="text-2xl font-bold text-foreground">
                {data.inputType?.toUpperCase()}
              </div>
              <div className="text-xs text-muted-foreground">Type</div>
            </div>
          </div>
        </div>

        {/* Geolocation */}
        {data.ipinfo && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              Geolocation
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2 rounded-lg bg-muted/20">
                <div className="text-xs text-muted-foreground">Country</div>
                <div className="text-sm font-medium text-foreground">
                  {data.ipinfo.country || "N/A"}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-muted/20">
                <div className="text-xs text-muted-foreground">Region</div>
                <div className="text-sm font-medium text-foreground">
                  {data.ipinfo.region || "N/A"}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-muted/20">
                <div className="text-xs text-muted-foreground">City</div>
                <div className="text-sm font-medium text-foreground">
                  {data.ipinfo.city || "N/A"}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-muted/20">
                <div className="text-xs text-muted-foreground">Postal Code</div>
                <div className="text-sm font-medium text-foreground">
                  {data.ipinfo.postal || "N/A"}
                </div>
              </div>
              <div className="col-span-2 p-2 rounded-lg bg-muted/20">
                <div className="text-xs text-muted-foreground">Coordinates</div>
                <div className="text-sm font-medium text-foreground font-mono">
                  {data.ipinfo.loc || "N/A"}
                </div>
              </div>
              <div className="col-span-2 p-2 rounded-lg bg-muted/20">
                <div className="text-xs text-muted-foreground">Timezone</div>
                <div className="text-sm font-medium text-foreground">
                  {data.ipinfo.timezone || "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Network Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-purple-500" />
            Network Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-2 rounded-lg bg-muted/20">
              <div className="text-xs text-muted-foreground">
                ISP / Organization
              </div>
              <div className="text-sm font-medium text-foreground">
                {data.ipinfo?.org || "N/A"}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-muted/20">
              <div className="text-xs text-muted-foreground">ASN</div>
              <div className="text-sm font-medium text-foreground">
                {data.vt?.asn ? `AS${data.vt.asn}` : "N/A"}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-muted/20">
              <div className="text-xs text-muted-foreground">AS Owner</div>
              <div className="text-sm font-medium text-foreground">
                {data.vt?.as_owner || "N/A"}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-muted/20">
              <div className="text-xs text-muted-foreground">Network Range</div>
              <div className="text-sm font-medium text-foreground font-mono">
                {data.vt?.network || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Privacy Indicators */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-500" />
            Security & Privacy
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
              <span className="text-xs text-muted-foreground">VPN</span>
              <span
                className={`text-xs font-semibold ${data.vpnapi?.security?.vpn ? "text-red-500" : "text-green-500"}`}
              >
                {data.vpnapi?.security?.vpn ? "Detected" : "Clean"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
              <span className="text-xs text-muted-foreground">Proxy</span>
              <span
                className={`text-xs font-semibold ${data.vpnapi?.security?.proxy ? "text-red-500" : "text-green-500"}`}
              >
                {data.vpnapi?.security?.proxy ? "Detected" : "Clean"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
              <span className="text-xs text-muted-foreground">TOR</span>
              <span
                className={`text-xs font-semibold ${data.vpnapi?.security?.tor ? "text-red-500" : "text-green-500"}`}
              >
                {data.vpnapi?.security?.tor ? "Detected" : "Clean"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
              <span className="text-xs text-muted-foreground">Hosting</span>
              <span
                className={`text-xs font-semibold ${data.ipinfo?.is_hosting ? "text-yellow-500" : "text-green-500"}`}
              >
                {data.ipinfo?.is_hosting ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* Threat Intelligence Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-500" />
            Threat Intelligence
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-2 rounded-lg bg-muted/20">
              <div className="text-lg font-bold text-foreground">
                {data.vt?.last_analysis_stats?.malicious || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                VirusTotal Malicious
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/20">
              <div className="text-lg font-bold text-foreground">
                {data.abuseipdb?.abuseConfidenceScore || 0}%
              </div>
              <div className="text-xs text-muted-foreground">
                AbuseIPDB Confidence
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/20">
              <div className="text-lg font-bold text-foreground">
                {data.abuseipdb?.totalReports || 0}
              </div>
              <div className="text-xs text-muted-foreground">Abuse Reports</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/20">
              <div className="text-lg font-bold text-foreground">
                {data.otx?.pulse_count || 0}
              </div>
              <div className="text-xs text-muted-foreground">OTX Pulses</div>
            </div>
          </div>
        </div>

        {/* Blacklist Status */}
        {data.multirbl && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              Blacklist Status
            </h4>
            <div className="p-3 rounded-lg bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  RBL Blacklists
                </span>
                <span
                  className={`text-sm font-semibold ${data.multirbl.listedCount > 0 ? "text-red-500" : "text-green-500"}`}
                >
                  {data.multirbl.listedCount} / {data.multirbl.totalChecked}{" "}
                  Listed
                </span>
              </div>
              <div className="space-y-1">
                {data.multirbl.lists?.map((list, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">{list.name}</span>
                    {list.listed ? (
                      <span className="text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Listed
                      </span>
                    ) : (
                      <span className="text-green-500 flex items-center gap-1">
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
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last Analyzed
          </div>
          <div className="text-xs text-foreground">
            {new Date(data.timestamp).toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() =>
              window.open(`https://browserleaks.com/ip/${data.input}`, "_blank")
            }
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            TEST BROWSER LEAKS
          </button>
          <button
            onClick={() =>
              copyToClipboard(JSON.stringify(data, null, 2), "json")
            }
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-muted/20 hover:bg-muted/30 text-foreground rounded-lg transition-colors text-sm font-medium"
          >
            {copiedJSON ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy Report
          </button>
        </div>
      </div>
    </motion.div>
  );
}
