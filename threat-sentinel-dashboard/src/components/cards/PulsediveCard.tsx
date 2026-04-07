// src/components/cards/PulsediveCard.tsx
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
  MapPin,
  Building2,
  Globe,
  Network,
  Tag,
  ExternalLink,
  Activity,
  Server,
  Calendar,
  Eye,
} from "lucide-react";
import type { PulsediveData } from "@/types/threat";

export function PulsediveCard({ data }: { data: PulsediveData }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"threats" | "geo" | "feeds">(
    "threats",
  );

  const risk = data.risk || "none";
  const score = data.score || 0;
  const threats = data.threats || [];
  const properties = data.properties || {};
  const geo = properties.geo || {};
  const whois = properties.whois || {};
  const dns = properties.dns || {};
  const banners = properties.banners || {};
  const raw = data.raw || {};

  const getRiskColor = () => {
    if (score >= 75) return "text-red-500";
    if (score >= 50) return "text-orange-500";
    if (score >= 25) return "text-yellow-500";
    if (score > 0) return "text-green-500";
    return "text-muted-foreground";
  };

  const getRiskBg = () => {
    if (score >= 75) return "bg-red-500/10 border-red-500/30";
    if (score >= 50) return "bg-orange-500/10 border-orange-500/30";
    if (score >= 25) return "bg-yellow-500/10 border-yellow-500/30";
    if (score > 0) return "bg-green-500/10 border-green-500/30";
    return "bg-muted/30 border-border/30";
  };

  const getRiskLevel = () => {
    if (score >= 75) return "Critical";
    if (score >= 50) return "High";
    if (score >= 25) return "Medium";
    if (score > 0) return "Low";
    return "None";
  };

  const riskColor = getRiskColor();
  const riskBg = getRiskBg();
  const riskLevel = getRiskLevel();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get unique threat feeds
  const feeds = raw.feeds || [];
  const uniqueFeeds = feeds.slice(0, 6);

  // Get risk factors
  const riskFactors = raw.riskfactors || [];

  return (
    <div className="bg-card border-l-2 border-blue-500/60">
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
            background: rgba(59, 130, 246, 0.2);
            border-radius: 0;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(59, 130, 246, 0.4);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(59, 130, 246, 0.2) transparent;
          }
        `}
      </style>

      {/* Header - Clickable to expand/collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-blue-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            Pulsedive
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          {threats.length} threats
        </span>

        <div className="flex items-center gap-2 ml-2">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-16 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full ${score >= 75 ? "bg-red-500" : score >= 50 ? "bg-orange-500" : score >= 25 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-[9px] font-medium ${riskColor}`}>
              {score}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 border ${riskBg} ${riskColor}`}
          >
            {riskLevel}
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
              <span className="text-muted-foreground">Location:</span>
              <span className="text-foreground/80 truncate max-w-[180px]">
                {geo.city && geo.country
                  ? `${geo.city}, ${geo.country}`
                  : geo.country || "Unknown"}
              </span>
            </div>
            {feeds.length > 0 && (
              <div className="flex items-center gap-1">
                <Activity className="h-2.5 w-2.5 text-muted-foreground/40" />
                <span className="text-muted-foreground">
                  {feeds.length} feeds
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {geo.asn || "Unknown"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://pulsedive.com/ip/${raw.indicator || "search"}`,
                  "_blank",
                );
              }}
              className="text-blue-500/70 hover:text-blue-500 flex items-center gap-0.5"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              <span>View</span>
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="p-3">
          {/* Risk Score Bar */}
          <div className="flex items-center gap-3 mb-2 pb-2 border-b border-border/20">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-1">
                <AlertTriangle
                  className={`h-3.5 w-3.5 ${score >= 50 ? "text-red-500" : "text-yellow-500"}`}
                />
                <span className="text-[10px] text-muted-foreground">
                  Risk Score
                </span>
              </div>
              <div className="flex-1 h-2 bg-muted/30 rounded-full max-w-[200px]">
                <div
                  className={`h-full rounded-full ${score >= 75 ? "bg-red-500" : score >= 50 ? "bg-orange-500" : score >= 25 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${riskColor}`}>
                {score}/100
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-0.5 mb-2">
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="text-[8px] font-medium text-muted-foreground uppercase tracking-tight">
                Threats
              </div>
              <div className="text-sm font-bold tabular-nums text-foreground">
                {threats.length}
              </div>
            </div>

            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="text-[8px] font-medium text-muted-foreground uppercase tracking-tight">
                Feeds
              </div>
              <div className="text-sm font-bold tabular-nums text-foreground">
                {feeds.length}
              </div>
            </div>

            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="text-[8px] font-medium text-muted-foreground uppercase tracking-tight">
                Factors
              </div>
              <div className="text-sm font-bold tabular-nums text-foreground">
                {riskFactors.length}
              </div>
            </div>

            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="text-[8px] font-medium text-muted-foreground uppercase tracking-tight">
                Risk
              </div>
              <div className={`text-sm font-bold ${riskColor}`}>
                {riskLevel}
              </div>
            </div>
          </div>

          {/* Location & Network Details */}
          <div className="space-y-0.5 mb-2">
            <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-0.5">
              Network Information
            </div>
            <div className="space-y-0">
              {/* Location */}
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <MapPin className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                  Location
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {geo.city && geo.country
                    ? `${geo.city}, ${geo.country}`
                    : geo.country || "Unknown"}
                </span>
              </div>

              {/* ASN */}
              {geo.asn && (
                <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                  <Network className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                    ASN
                  </span>
                  <span className="text-[10px] font-medium text-foreground truncate ml-1">
                    {geo.asn}
                  </span>
                </div>
              )}

              {/* Organization */}
              {geo.org && (
                <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                  <Building2 className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                    Org
                  </span>
                  <span className="text-[10px] font-medium text-foreground truncate ml-1">
                    {Array.isArray(geo.org) ? geo.org.join(", ") : geo.org}
                  </span>
                </div>
              )}

              {/* PTR Record */}
              {dns.ptr && (
                <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                  <Globe className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                    PTR
                  </span>
                  <span className="text-[10px] font-medium text-foreground truncate ml-1">
                    {dns.ptr}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-2 pt-2 border-t border-border/20">
            <div className="flex gap-1 mb-2 border-b border-border/20">
              <button
                onClick={() => setActiveTab("threats")}
                className={`px-2 py-1 text-[9px] font-medium transition-colors ${
                  activeTab === "threats"
                    ? "border-b border-blue-500 text-blue-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Threats ({threats.length})
              </button>
              <button
                onClick={() => setActiveTab("geo")}
                className={`px-2 py-1 text-[9px] font-medium transition-colors ${
                  activeTab === "geo"
                    ? "border-b border-blue-500 text-blue-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                WHOIS
              </button>
              <button
                onClick={() => setActiveTab("feeds")}
                className={`px-2 py-1 text-[9px] font-medium transition-colors ${
                  activeTab === "feeds"
                    ? "border-b border-blue-500 text-blue-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Feeds ({feeds.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
              {/* Threats Tab */}
              {activeTab === "threats" && (
                <div className="divide-y divide-border/10">
                  {threats.length > 0 ? (
                    threats.map((threat, idx) => (
                      <div key={idx} className="py-2 px-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-medium text-foreground">
                              {threat.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[8px] text-muted-foreground capitalize">
                                {threat.category || "general"}
                              </span>
                              {threat.stamp_linked && (
                                <span className="text-[8px] text-muted-foreground/60 flex items-center gap-0.5">
                                  <Calendar className="h-2 w-2" />
                                  {formatDate(threat.stamp_linked)}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-[8px] px-1.5 py-0.5 border capitalize ${
                              threat.risk === "high"
                                ? "bg-red-500/10 text-red-500 border-red-500/30"
                                : threat.risk === "medium"
                                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                                  : "bg-green-500/10 text-green-500 border-green-500/30"
                            }`}
                          >
                            {threat.risk || "low"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[9px] text-muted-foreground">
                      No threats identified
                    </div>
                  )}
                </div>
              )}

              {/* WHOIS Tab */}
              {activeTab === "geo" && (
                <div className="space-y-1">
                  {Object.keys(whois).length > 0 ? (
                    <>
                      {whois.netname && (
                        <div className="flex items-center py-1 px-1">
                          <span className="text-[9px] text-muted-foreground w-20 flex-shrink-0">
                            Network
                          </span>
                          <span className="text-[9px] text-foreground truncate">
                            {Array.isArray(whois.netname)
                              ? whois.netname[0]
                              : whois.netname}
                          </span>
                        </div>
                      )}
                      {whois.organization && (
                        <div className="flex items-center py-1 px-1">
                          <span className="text-[9px] text-muted-foreground w-20 flex-shrink-0">
                            Organization
                          </span>
                          <span className="text-[9px] text-foreground truncate">
                            {Array.isArray(whois.organization)
                              ? whois.organization[0]
                              : whois.organization}
                          </span>
                        </div>
                      )}
                      {whois.country && (
                        <div className="flex items-center py-1 px-1">
                          <span className="text-[9px] text-muted-foreground w-20 flex-shrink-0">
                            Country
                          </span>
                          <span className="text-[9px] text-foreground">
                            {Array.isArray(whois.country)
                              ? whois.country[0]
                              : whois.country}
                          </span>
                        </div>
                      )}
                      {whois.city && (
                        <div className="flex items-center py-1 px-1">
                          <span className="text-[9px] text-muted-foreground w-20 flex-shrink-0">
                            City
                          </span>
                          <span className="text-[9px] text-foreground">
                            {Array.isArray(whois.city)
                              ? whois.city[0]
                              : whois.city}
                          </span>
                        </div>
                      )}
                      {whois.regdate && (
                        <div className="flex items-center py-1 px-1">
                          <span className="text-[9px] text-muted-foreground w-20 flex-shrink-0">
                            Registered
                          </span>
                          <span className="text-[9px] text-foreground">
                            {Array.isArray(whois.regdate)
                              ? whois.regdate[0]
                              : whois.regdate}
                          </span>
                        </div>
                      )}
                      {whois.netrange && (
                        <div className="flex items-center py-1 px-1">
                          <span className="text-[9px] text-muted-foreground w-20 flex-shrink-0">
                            Range
                          </span>
                          <span className="text-[9px] text-foreground font-mono truncate">
                            {Array.isArray(whois.netrange)
                              ? whois.netrange[0]
                              : whois.netrange}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-[9px] text-muted-foreground">
                      No WHOIS data available
                    </div>
                  )}
                </div>
              )}

              {/* Feeds Tab */}
              {activeTab === "feeds" && (
                <div className="space-y-1">
                  {feeds.length > 0 ? (
                    <>
                      {uniqueFeeds.map((feed: any, idx: number) => (
                        <div key={idx} className="py-1.5 px-1">
                          <div className="text-[10px] font-medium text-foreground">
                            {feed.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] text-muted-foreground">
                              {feed.category || "threat feed"}
                            </span>
                            {feed.organization && (
                              <span className="text-[8px] text-muted-foreground/60">
                                {feed.organization}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {feeds.length > 6 && (
                        <div className="text-center py-1">
                          <span className="text-[8px] text-muted-foreground">
                            +{feeds.length - 6} more feeds
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-[9px] text-muted-foreground">
                      No threat feeds associated
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Risk Factors */}
          {riskFactors.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/20">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Risk Factors
              </div>
              <div className="flex flex-wrap gap-1">
                {riskFactors.slice(0, 4).map((factor: any, idx: number) => (
                  <span
                    key={idx}
                    className={`text-[9px] px-1.5 py-0.5 border ${
                      factor.risk === "high"
                        ? "bg-red-500/10 text-red-500 border-red-500/30"
                        : factor.risk === "medium"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                          : "bg-muted/30 text-muted-foreground border-border/30"
                    }`}
                  >
                    {factor.description}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Observed Ports */}
          {raw.attributes?.port && raw.attributes.port.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground">Ports:</span>
              <div className="flex flex-wrap gap-1">
                {raw.attributes.port
                  .slice(0, 5)
                  .map((port: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[9px] px-1.5 py-0.5 bg-muted/30 text-foreground font-mono border border-border/30"
                    >
                      {port}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* View Full Report Button */}
          <button
            onClick={() =>
              window.open(
                `https://pulsedive.com/ip/${raw.indicator || "search"}`,
                "_blank",
              )
            }
            className="w-full mt-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[10px] font-medium hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Full Report on Pulsedive
          </button>
        </div>
      )}
    </div>
  );
}
