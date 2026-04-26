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

  // Add null checks with fallbacks
  const classification = data?.classification || "unknown";
  const isNoise = data?.noise ?? false;
  const isVPN = data?.vpn ?? false;
  const isProxy = data?.proxy ?? false;
  const isTor = data?.tor ?? false;
  const isBot = data?.bot ?? false;
  const isMobile = data?.mobile ?? false;
  const isDatacenter = data?.datacenter ?? false;
  const riot = data?.riot ?? false;
  const seen = data?.seen ?? data?.raw?.seen ?? false;

  const ipAddress = data?.ip || data?.raw?.ip || "Unknown";
  const organization =
    data?.organization || data?.raw?.organization || "Unknown";
  const asn = data?.asn || data?.raw?.asn || "Unknown";
  const country = data?.country || data?.raw?.location?.country || "Unknown";
  const countryCode =
    data?.country_code || data?.raw?.location?.country_code || "Unknown";
  const city = data?.city || data?.raw?.location?.city || "Unknown";
  const firstSeen = data?.first_seen || data?.raw?.first_seen;
  const lastSeen = data?.last_seen || data?.raw?.last_seen;
  const tags = data?.tags || data?.raw?.tags || [];
  const cve = data?.cve || data?.raw?.cve || [];
  const link = data?.link || data?.raw?.link;

  const getClassificationConfig = () => {
    switch (classification) {
      case "benign":
        return {
          color: "text-risk-low",
          bg: "bg-risk-low/15",
          border: "border-risk-low/40",
          icon: CheckCircle,
          label: "Benign",
          barClass: "bg-risk-low",
        };
      case "malicious":
        return {
          color: "text-risk-critical",
          bg: "bg-risk-critical/15",
          border: "border-risk-critical/40",
          icon: XCircle,
          label: "Malicious",
          barClass: "bg-risk-critical",
        };
      default:
        return {
          color: "text-risk-high",
          bg: "bg-risk-high/15",
          border: "border-risk-high/40",
          icon: AlertCircle,
          label: "Unknown",
          barClass: "bg-risk-high",
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

  const getNoiseColorClass = () => {
    if (isNoise && classification === "malicious") return "text-risk-critical";
    if (isNoise) return "text-risk-high";
    return "text-risk-low";
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
    <div className="bg-surface-0 border-l-4 border-brand-primary shadow-md">
      {/* Header Button - Collapsible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="group w-full px-4 py-3 border-b border-border flex items-center gap-3 bg-gradient-to-r from-brand-primary/5 via-surface-1 to-surface-1 hover:from-brand-primary/10 hover:via-surface-2 hover:to-surface-2 transition-all duration-200 cursor-pointer text-left"
      >
        <div className="flex items-center justify-center w-7 h-7 bg-brand-primary/15 border border-brand-primary/30">
          <Volume2 className="h-3.5 w-3.5 text-brand-primary" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-wide text-foreground uppercase">
            GreyNoise
          </span>
          <span className="text-[9px] font-mono text-brand-primary-dark bg-brand-primary/10 px-1.5 py-0.5 border border-brand-primary/20">
            {seen ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-brand-primary/60" />
            <span className={`text-[9px] font-bold ${getNoiseColorClass()}`}>
              {getNoiseLevel()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 w-20 bg-muted/30">
              <div
                className={`h-full ${config.barClass} transition-all duration-300`}
                style={{
                  width:
                    classification === "malicious"
                      ? "100%"
                      : classification === "benign"
                        ? "0%"
                        : "50%",
                }}
              />
            </div>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 border ${config.bg} ${config.color} uppercase tracking-wide`}
            >
              {config.label.toUpperCase()}
            </span>
          </div>
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
              <Building2 className="h-3 w-3 text-brand-primary/60" />
              <span className="text-muted-foreground">Org:</span>
              <span className="text-foreground/80 truncate max-w-[200px]">
                {organization}
              </span>
            </div>
            {riot && (
              <span className="text-[8px] px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary-dark border border-brand-primary/30 font-mono">
                RIOT
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground font-mono text-[11px] flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 text-brand-primary/50" />
              {countryCode}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://viz.greynoise.io/ip/${ipAddress}`,
                  "_blank",
                );
              }}
              className="text-brand-primary hover:text-brand-primary-dark flex items-center gap-1 transition-colors text-[10px] font-medium bg-brand-primary/10 px-2 py-0.5 border border-brand-primary/20"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              <span>View</span>
            </button>
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
                Internet Noise Intelligence
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Real-time classification of internet scanners and malicious
              activity
            </p>
          </div>

          {/* Classification & Noise Status */}
          <div className="flex items-center gap-4 p-3 bg-surface-1 border border-border/30">
            <div className="flex items-center gap-2">
              <ClassificationIcon className={`h-5 w-5 ${config.color}`} />
              <div>
                <div className="text-[9px] text-muted-foreground">
                  Classification
                </div>
                <div className={`text-sm font-bold ${config.color}`}>
                  {config.label}
                </div>
              </div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <Volume2 className={`h-5 w-5 ${getNoiseColorClass()}`} />
              <div>
                <div className="text-[9px] text-muted-foreground">
                  Noise Level
                </div>
                <div className={`text-sm font-bold ${getNoiseColorClass()}`}>
                  {isNoise ? "Internet Scanner" : "Not a Scanner"}
                </div>
              </div>
            </div>
          </div>

          {/* Security Indicators Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-brand-primary/10 border border-brand-primary/20">
            <div className="px-2 py-2 bg-surface-1 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Wifi
                  className={`h-3 w-3 ${isVPN ? "text-risk-high" : "text-risk-low"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  VPN
                </span>
              </div>
              <div
                className={`text-[10px] font-bold ${isVPN ? "text-risk-high" : "text-risk-low"}`}
              >
                {isVPN ? "YES" : "NO"}
              </div>
            </div>
            <div className="px-2 py-2 bg-surface-1 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Eye
                  className={`h-3 w-3 ${isProxy ? "text-risk-high" : "text-risk-low"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  Proxy
                </span>
              </div>
              <div
                className={`text-[10px] font-bold ${isProxy ? "text-risk-high" : "text-risk-low"}`}
              >
                {isProxy ? "YES" : "NO"}
              </div>
            </div>
            <div className="px-2 py-2 bg-surface-1 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Lock
                  className={`h-3 w-3 ${isTor ? "text-risk-high" : "text-risk-low"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  TOR
                </span>
              </div>
              <div
                className={`text-[10px] font-bold ${isTor ? "text-risk-high" : "text-risk-low"}`}
              >
                {isTor ? "YES" : "NO"}
              </div>
            </div>
            <div className="px-2 py-2 bg-surface-1 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Bot
                  className={`h-3 w-3 ${isBot ? "text-risk-critical" : "text-risk-low"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  Bot
                </span>
              </div>
              <div
                className={`text-[10px] font-bold ${isBot ? "text-risk-critical" : "text-risk-low"}`}
              >
                {isBot ? "YES" : "NO"}
              </div>
            </div>
            <div className="px-2 py-2 bg-surface-1 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Server
                  className={`h-3 w-3 ${isDatacenter ? "text-brand-primary" : "text-risk-low"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  DC
                </span>
              </div>
              <div
                className={`text-[10px] font-bold ${isDatacenter ? "text-brand-primary" : "text-risk-low"}`}
              >
                {isDatacenter ? "YES" : "NO"}
              </div>
            </div>
            <div className="px-2 py-2 bg-surface-1 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Network
                  className={`h-3 w-3 ${isMobile ? "text-brand-secondary" : "text-muted-foreground"}`}
                />
                <span className="text-[8px] font-medium text-muted-foreground uppercase">
                  Mobile
                </span>
              </div>
              <div
                className={`text-[10px] font-bold ${isMobile ? "text-brand-secondary" : "text-muted-foreground"}`}
              >
                {isMobile ? "YES" : "NO"}
              </div>
            </div>
          </div>

          {/* Network Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-brand-primary/5 border-l-4 border-brand-primary">
              <Network className="h-3.5 w-3.5 text-brand-primary" />
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                Network Information
              </span>
            </div>
            <div className="space-y-px bg-border/20 border border-border/20">
              <div className="flex items-center py-2.5 px-3 hover:bg-brand-primary/5 transition-colors">
                <div className="flex items-center gap-2 w-24 flex-shrink-0">
                  <Building2 className="h-3.5 w-3.5 text-brand-primary/60" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Organization
                  </span>
                </div>
                <span className="text-[11px] font-mono text-foreground truncate">
                  {organization}
                </span>
              </div>
              <div className="flex items-center py-2.5 px-3 hover:bg-brand-primary/5 transition-colors">
                <div className="flex items-center gap-2 w-24 flex-shrink-0">
                  <Network className="h-3.5 w-3.5 text-brand-primary/60" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    ASN
                  </span>
                </div>
                <span className="text-[11px] font-mono text-foreground">
                  {asn}
                </span>
              </div>
              <div className="flex items-center py-2.5 px-3 hover:bg-brand-primary/5 transition-colors">
                <div className="flex items-center gap-2 w-24 flex-shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-brand-primary/60" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Location
                  </span>
                </div>
                <span className="text-[11px] font-mono text-foreground">
                  {city !== "Unknown" ? `${city}, ${country}` : country}
                </span>
              </div>
              <div className="flex items-center py-2.5 px-3 hover:bg-brand-primary/5 transition-colors">
                <div className="flex items-center gap-2 w-24 flex-shrink-0">
                  <Globe className="h-3.5 w-3.5 text-brand-primary/60" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Country Code
                  </span>
                </div>
                <span className="text-[11px] font-mono text-foreground">
                  {countryCode}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          {(firstSeen || lastSeen) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-brand-secondary/5 border-l-4 border-brand-secondary">
                <Calendar className="h-3.5 w-3.5 text-brand-secondary" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Activity Timeline
                </span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-brand-primary/10 border border-brand-primary/20">
                {firstSeen && (
                  <div className="px-3 py-2 bg-surface-1">
                    <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                      First Seen
                    </div>
                    <div className="text-[11px] font-mono text-foreground mt-0.5">
                      {formatDate(firstSeen)}
                    </div>
                  </div>
                )}
                {lastSeen && (
                  <div className="px-3 py-2 bg-surface-1">
                    <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                      Last Seen
                    </div>
                    <div className="text-[11px] font-mono text-foreground mt-0.5">
                      {formatDate(lastSeen)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-brand-primary/5 border-l-4 border-brand-primary">
                <Tag className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Tags ({tags.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1 p-2 bg-surface-1 border border-border/30 max-h-[80px] overflow-y-auto custom-scrollbar">
                {tags.slice(0, 12).map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary-dark border border-brand-primary/20 font-mono"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 12 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{tags.length - 12} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* CVEs */}
          {cve.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-risk-critical/5 border-l-4 border-risk-critical">
                <AlertCircle className="h-3.5 w-3.5 text-risk-critical" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Associated CVEs ({cve.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1 p-2 bg-surface-1 border border-border/30">
                {cve.slice(0, 6).map((cveId: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 bg-risk-critical/10 text-risk-critical border border-risk-critical/30 font-mono"
                  >
                    {cveId}
                  </span>
                ))}
                {cve.length > 6 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{cve.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2 p-2 bg-surface-1 border border-border/30">
            {riot && (
              <span className="text-[9px] px-2 py-1 bg-brand-primary/10 text-brand-primary-dark border border-brand-primary/30 font-mono flex items-center gap-1">
                <Shield className="h-3 w-3" />
                RIOT Verified
              </span>
            )}
            {isNoise && classification === "malicious" && (
              <span className="text-[9px] px-2 py-1 bg-risk-critical/10 text-risk-critical border border-risk-critical/30 font-mono flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Malicious Scanner
              </span>
            )}
          </div>

          {/* Description Note */}
          <div className="p-3 bg-surface-1 border-l-4 border-brand-primary">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-brand-primary mt-0.5 flex-shrink-0" />
              <div className="text-[10px] text-muted-foreground leading-relaxed">
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t border-brand-primary/20">
            <button
              onClick={() =>
                window.open(
                  `https://viz.greynoise.io/ip/${ipAddress}`,
                  "_blank",
                )
              }
              className="flex-1 py-2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary-dark transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on GreyNoise
            </button>
          </div>

          {/* Brand Footer */}
          <div className="text-center pt-2 border-t border-brand-primary/10">
            <span className="text-[8px] text-muted-foreground/60">
              Powered by{" "}
              <span className="text-brand-primary font-mono">GreyNoise</span> •
              Internet noise intelligence
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
