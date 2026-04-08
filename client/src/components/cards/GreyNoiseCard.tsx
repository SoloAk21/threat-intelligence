// src/components/cards/GreyNoiseCard.tsx
import { useState } from "react";
import {
  Volume2,
  Shield,
  Wifi,
  Lock,
  Bot,
  Activity,
  MapPin,
  Building2,
  Tag,
  Clock,
  Globe,
  Server,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Network,
  Calendar,
} from "lucide-react";
import type { GreyNoiseData } from "@/types/threat";

export function GreyNoiseCard({ data }: { data: GreyNoiseData }) {
  const [expanded, setExpanded] = useState(false);

  const classification = data.classification || "unknown";
  const isNoise = data.noise;
  const isVPN = data.vpn || false;
  const isProxy = data.proxy || false;
  const isTor = data.tor || false;
  const isBot = data.bot || false;
  const isMobile = data.mobile || false;
  const isDatacenter = data.datacenter || false;

  const ipAddress = data.ip || data.raw?.ip || "Unknown";
  const organization = data.raw?.organization || data.organization || "Unknown";
  const asn = data.raw?.asn || data.asn || "Unknown";
  const country = data.raw?.country || data.country || "Unknown";
  const countryCode = data.raw?.country_code || data.countryCode || "Unknown";
  const city = data.raw?.city || data.city || "Unknown";
  const firstSeen = data.raw?.first_seen || data.firstSeen;
  const lastSeen = data.raw?.last_seen || data.lastSeen;
  const tags = data.tags || data.raw?.tags || [];
  const cve = data.raw?.cve || data.cve || [];
  const link = data.raw?.link || data.link;
  const riot = data.raw?.riot || data.riot || false;
  const seen = data.seen || data.raw?.seen || false;

  const getClassificationConfig = () => {
    switch (classification) {
      case "benign":
        return {
          color: "text-green-500",
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          icon: CheckCircle,
          label: "Benign",
        };
      case "malicious":
        return {
          color: "text-red-500",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          icon: XCircle,
          label: "Malicious",
        };
      default:
        return {
          color: "text-yellow-500",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          icon: AlertCircle,
          label: "Unknown",
        };
    }
  };

  const config = getClassificationConfig();
  const ClassificationIcon = config.icon;

  const getNoiseLevel = () => {
    if (isNoise && classification === "malicious") return "High Noise";
    if (isNoise) return "Scanner";
    return "Clean";
  };

  const getNoiseColor = () => {
    if (isNoise && classification === "malicious") return "text-red-500";
    if (isNoise) return "text-orange-500";
    return "text-green-500";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-card border-l-2 border-gray-500/60">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(107, 114, 128, 0.2);
            border-radius: 0;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(107, 114, 128, 0.4);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(107, 114, 128, 0.2) transparent;
          }
        `}
      </style>

      {/* Header - Clickable to expand/collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Volume2 className="h-3 w-3 text-gray-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            GreyNoise
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          {seen ? "Active" : "Inactive"}
        </span>

        <div className="flex items-center gap-2 ml-2">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-muted-foreground/40" />
            <span className={`text-[9px] font-medium ${getNoiseColor()}`}>
              {getNoiseLevel()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 border ${config.bg} ${config.color}`}
          >
            {config.label.toUpperCase()}
          </span>
          {expanded ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground/50" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
          )}
        </div>
      </button>

      {/* Collapsed Summary Info */}
      {!expanded && (
        <div className="px-3 py-2 flex items-center justify-between text-[9px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Org:</span>
              <span className="text-foreground/80 truncate max-w-[180px]">
                {organization}
              </span>
            </div>
            {riot && (
              <span className="text-[8px] px-1 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/30">
                RIOT
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">{countryCode}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://viz.greynoise.io/ip/${ipAddress}`,
                  "_blank",
                );
              }}
              className="text-gray-500/70 hover:text-gray-500 flex items-center gap-0.5"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              <span>View</span>
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="p-3">
          {/* Classification & Noise Bar */}
          <div className="flex items-center gap-3 mb-2 pb-2 border-b border-border/20">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-1">
                <ClassificationIcon className={`h-3.5 w-3.5 ${config.color}`} />
                <span className="text-[10px] text-muted-foreground">
                  Classification
                </span>
              </div>
              <span className={`text-[10px] font-bold ${config.color}`}>
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className={`h-3 w-3 ${getNoiseColor()}`} />
              <span className={`text-[10px] font-medium ${getNoiseColor()}`}>
                {isNoise ? "Internet Scanner" : "Not a Scanner"}
              </span>
            </div>
          </div>

          {/* Security Indicators Grid - 6 columns */}
          <div className="grid grid-cols-6 gap-0.5 mb-2">
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="flex items-center justify-center gap-0.5">
                <Wifi
                  className={`h-2.5 w-2.5 ${isVPN ? "text-orange-500" : "text-green-500"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  VPN
                </span>
              </div>
              <div
                className={`text-[9px] font-bold text-center ${isVPN ? "text-orange-500" : "text-green-500"}`}
              >
                {isVPN ? "YES" : "NO"}
              </div>
            </div>

            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="flex items-center justify-center gap-0.5">
                <Eye
                  className={`h-2.5 w-2.5 ${isProxy ? "text-yellow-500" : "text-green-500"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  Proxy
                </span>
              </div>
              <div
                className={`text-[9px] font-bold text-center ${isProxy ? "text-yellow-500" : "text-green-500"}`}
              >
                {isProxy ? "YES" : "NO"}
              </div>
            </div>

            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="flex items-center justify-center gap-0.5">
                <Lock
                  className={`h-2.5 w-2.5 ${isTor ? "text-purple-500" : "text-green-500"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  TOR
                </span>
              </div>
              <div
                className={`text-[9px] font-bold text-center ${isTor ? "text-purple-500" : "text-green-500"}`}
              >
                {isTor ? "YES" : "NO"}
              </div>
            </div>

            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="flex items-center justify-center gap-0.5">
                <Bot
                  className={`h-2.5 w-2.5 ${isBot ? "text-red-500" : "text-green-500"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  Bot
                </span>
              </div>
              <div
                className={`text-[9px] font-bold text-center ${isBot ? "text-red-500" : "text-green-500"}`}
              >
                {isBot ? "YES" : "NO"}
              </div>
            </div>

            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="flex items-center justify-center gap-0.5">
                <Server
                  className={`h-2.5 w-2.5 ${isDatacenter ? "text-blue-500" : "text-green-500"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  DC
                </span>
              </div>
              <div
                className={`text-[9px] font-bold text-center ${isDatacenter ? "text-blue-500" : "text-green-500"}`}
              >
                {isDatacenter ? "YES" : "NO"}
              </div>
            </div>

            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="flex items-center justify-center gap-0.5">
                <Network
                  className={`h-2.5 w-2.5 ${isMobile ? "text-cyan-500" : "text-muted-foreground"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  Mobile
                </span>
              </div>
              <div
                className={`text-[9px] font-bold text-center ${isMobile ? "text-cyan-500" : "text-muted-foreground"}`}
              >
                {isMobile ? "YES" : "NO"}
              </div>
            </div>
          </div>

          {/* Location & Network Details */}
          <div className="space-y-0.5 mb-2">
            <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-0.5">
              Network Information
            </div>
            <div className="space-y-0">
              {/* Organization */}
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <Building2 className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-10 flex-shrink-0">
                  Org
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {organization}
                </span>
              </div>

              {/* ASN */}
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <Network className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-10 flex-shrink-0">
                  ASN
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {asn}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <MapPin className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-10 flex-shrink-0">
                  Location
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {city !== "Unknown" ? `${city}, ${country}` : country}
                </span>
              </div>

              {/* Country */}
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <Globe className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-10 flex-shrink-0">
                  Country
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {countryCode}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          {(firstSeen || lastSeen) && (
            <div className="mb-2">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-0.5">
                Activity Timeline
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {firstSeen && (
                  <div className="px-2 py-1 bg-muted/5 border border-border/10 rounded">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5 text-muted-foreground/40" />
                      <span className="text-[8px] text-muted-foreground">
                        First Seen
                      </span>
                    </div>
                    <div className="text-[10px] font-medium text-foreground mt-0.5">
                      {formatDate(firstSeen)}
                    </div>
                  </div>
                )}
                {lastSeen && (
                  <div className="px-2 py-1 bg-muted/5 border border-border/10 rounded">
                    <div className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 text-muted-foreground/40" />
                      <span className="text-[8px] text-muted-foreground">
                        Last Seen
                      </span>
                    </div>
                    <div className="text-[10px] font-medium text-foreground mt-0.5">
                      {formatDate(lastSeen)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-2">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Tags ({tags.length})
              </div>
              <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto custom-scrollbar">
                {tags.slice(0, 8).map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 bg-gray-500/10 text-gray-500 border border-gray-500/30"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 8 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{tags.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* CVE List */}
          {cve.length > 0 && (
            <div className="mb-2">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                CVEs ({cve.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {cve.slice(0, 4).map((cveId: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/30"
                  >
                    {cveId}
                  </span>
                ))}
                {cve.length > 4 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{cve.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="flex items-center gap-2 mb-2">
            {riot && (
              <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/30">
                🛡️ RIOT Verified
              </span>
            )}
            {isNoise && classification === "malicious" && (
              <span className="text-[9px] px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/30">
                ⚠️ Malicious Scanner
              </span>
            )}
          </div>

          {/* Description Note */}
          <div className="p-2 bg-muted/5 border border-border/20 rounded mb-2">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="h-3 w-3 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
              <div className="text-[9px] text-muted-foreground">
                {classification === "benign" && isNoise && (
                  <p>
                    This IP is actively scanning the internet but has not been
                    identified as malicious. It may be a security scanner or
                    research tool.
                  </p>
                )}
                {classification === "malicious" && (
                  <p>
                    This IP has been identified as malicious based on observed
                    attack patterns and threat intelligence feeds.
                  </p>
                )}
                {classification === "unknown" && !isNoise && (
                  <p>
                    No significant internet scanning or malicious activity has
                    been observed from this IP address.
                  </p>
                )}
                {classification === "unknown" && isNoise && (
                  <p>
                    This IP is actively scanning but has not been classified as
                    malicious. Exercise caution.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* View Full Report Button */}
          <button
            onClick={() =>
              window.open(`https://viz.greynoise.io/ip/${ipAddress}`, "_blank")
            }
            className="w-full py-1.5 bg-gray-500/10 border border-gray-500/30 text-gray-500 text-[10px] font-medium hover:bg-gray-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View Full Report on GreyNoise
          </button>
        </div>
      )}
    </div>
  );
}
