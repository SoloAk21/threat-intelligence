// src/components/cards/OTXCard.tsx
import { useState } from "react";
import {
  Shield,
  MapPin,
  Network,
  Tag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  AlertCircle,
  Activity,
  Database,
  Link,
  FileText,
  Calendar,
  Info,
} from "lucide-react";
import type { OTXData } from "@/types/threat";

export function OTXCard({ data }: { data: OTXData }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "pulses" | "dns" | "urls" | "files"
  >("pulses");

  const pulseCount = data.pulse_count || 0;
  const pulses = data.raw?.pulse_info?.pulses || [];
  const tags = data.tags || [];
  const references = data.raw?.pulse_info?.references || [];

  // Location from raw data
  const location =
    data.raw?.city && data.raw?.country_name
      ? `${data.raw.city}, ${data.raw.country_name}`
      : data.raw?.country_name || "Unknown";
  const countryCode = data.raw?.country_code || "Unknown";
  const asn = data.raw?.asn || "Unknown";

  // Calculate indicator counts from pulses
  const indicatorCounts = {
    pulses: pulseCount,
    dns: 0,
    urls: 0,
    files: 0,
    ipv4: 0,
    ipv6: 0,
  };

  pulses.forEach((pulse: any) => {
    if (pulse.indicator_type_counts) {
      indicatorCounts.dns += pulse.indicator_type_counts.domain || 0;
      indicatorCounts.urls += pulse.indicator_type_counts.URL || 0;
      indicatorCounts.files +=
        pulse.indicator_type_counts["FileHash-SHA256"] || 0;
      indicatorCounts.ipv4 += pulse.indicator_type_counts.IPv4 || 0;
      indicatorCounts.ipv6 += pulse.indicator_type_counts.IPv6 || 0;
    }
  });

  // Get unique malware families
  const malwareFamilies = pulses.flatMap((p: any) => p.malware_families || []);
  const uniqueMalware = [
    ...new Set(malwareFamilies.map((m: any) => m.display_name || m)),
  ];

  // Get unique attack IDs
  const attackIds = pulses.flatMap((p: any) => p.attack_ids || []);
  const uniqueAttacks = [
    ...new Set(attackIds.map((a: any) => a.display_name || a)),
  ];

  // Get all tags from pulses
  const allPulseTags = pulses.flatMap((p: any) => p.tags || []);
  const uniqueTags = [...new Set([...tags, ...allPulseTags])].slice(0, 12);

  // Get TLP distribution
  const tlpCounts: Record<string, number> = {};
  pulses.forEach((p: any) => {
    if (p.TLP) tlpCounts[p.TLP] = (tlpCounts[p.TLP] || 0) + 1;
  });

  const getScoreColor = () => {
    if (pulseCount >= 50) return "text-red-500";
    if (pulseCount >= 20) return "text-orange-500";
    if (pulseCount >= 5) return "text-yellow-500";
    return "text-green-500";
  };

  const getScoreBg = () => {
    if (pulseCount >= 50) return "bg-red-500/10 border-red-500/30";
    if (pulseCount >= 20) return "bg-orange-500/10 border-orange-500/30";
    if (pulseCount >= 5) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-green-500/10 border-green-500/30";
  };

  const getRiskLevel = () => {
    if (pulseCount >= 50) return "Critical";
    if (pulseCount >= 20) return "High";
    if (pulseCount >= 5) return "Medium";
    return "Low";
  };

  const riskLevel = getRiskLevel();
  const scoreColor = getScoreColor();

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
    if (diffHours < 168) return `${Math.round(diffHours / 24)}d ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-card border-l-2 border-blue-500/60">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 0; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.4); }
          .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(59, 130, 246, 0.2) transparent; }
        `}
      </style>

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-blue-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            AlienVault OTX
          </span>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-1 ml-1">
          <span className="text-[9px] text-muted-foreground/50 px-1 py-0.5 bg-muted/30 flex items-center gap-0.5">
            <Activity className="h-2 w-2" />
            {formatCount(indicatorCounts.pulses)}
          </span>
          <span className="text-[9px] text-muted-foreground/50 px-1 py-0.5 bg-muted/30 flex items-center gap-0.5">
            <Globe className="h-2 w-2" />
            {formatCount(indicatorCounts.dns)}
          </span>
          <span className="text-[9px] text-muted-foreground/50 px-1 py-0.5 bg-muted/30 flex items-center gap-0.5">
            <Link className="h-2 w-2" />
            {formatCount(indicatorCounts.urls)}
          </span>
          <span className="text-[9px] text-muted-foreground/50 px-1 py-0.5 bg-muted/30 flex items-center gap-0.5">
            <FileText className="h-2 w-2" />
            {formatCount(indicatorCounts.files)}
          </span>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 border ${getScoreBg()} ${scoreColor}`}
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

      {/* Collapsed Summary */}
      {!expanded && (
        <div className="px-3 py-2 flex items-center justify-between text-[9px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Location:</span>
              <span className="text-foreground/80 truncate max-w-[180px]">
                {location}
              </span>
            </div>
            {uniqueTags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-2.5 w-2.5 text-muted-foreground/40" />
                <span className="text-muted-foreground">
                  {uniqueTags.length} tags
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">{countryCode}</span>
            <span
              className={data.is_malicious ? "text-red-500" : "text-green-500"}
            >
              {data.is_malicious ? "⚠ Malicious" : "✓ Clean"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://otx.alienvault.com/indicator/ip/${data.indicator}`,
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
          {/* Indicator Stats Grid - 6 columns for full breakdown */}
          <div className="grid grid-cols-6 gap-0.5 mb-2">
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10">
              <div className="text-[8px] font-medium text-muted-foreground uppercase flex items-center gap-0.5">
                <Activity className="h-2 w-2" />
                Pulses
              </div>
              <div className="text-xs font-bold tabular-nums text-foreground">
                {formatCount(indicatorCounts.pulses)}
              </div>
            </div>
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10">
              <div className="text-[8px] font-medium text-muted-foreground uppercase flex items-center gap-0.5">
                <Globe className="h-2 w-2" />
                DNS
              </div>
              <div className="text-xs font-bold tabular-nums text-foreground">
                {formatCount(indicatorCounts.dns)}
              </div>
            </div>
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10">
              <div className="text-[8px] font-medium text-muted-foreground uppercase flex items-center gap-0.5">
                <Link className="h-2 w-2" />
                URLs
              </div>
              <div className="text-xs font-bold tabular-nums text-foreground">
                {formatCount(indicatorCounts.urls)}
              </div>
            </div>
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10">
              <div className="text-[8px] font-medium text-muted-foreground uppercase flex items-center gap-0.5">
                <FileText className="h-2 w-2" />
                Files
              </div>
              <div className="text-xs font-bold tabular-nums text-foreground">
                {formatCount(indicatorCounts.files)}
              </div>
            </div>
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10">
              <div className="text-[8px] font-medium text-muted-foreground uppercase flex items-center gap-0.5">
                <Network className="h-2 w-2" />
                IPv4
              </div>
              <div className="text-xs font-bold tabular-nums text-foreground">
                {formatCount(indicatorCounts.ipv4)}
              </div>
            </div>
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10">
              <div className="text-[8px] font-medium text-muted-foreground uppercase flex items-center gap-0.5">
                <Network className="h-2 w-2" />
                IPv6
              </div>
              <div className="text-xs font-bold tabular-nums text-foreground">
                {formatCount(indicatorCounts.ipv6)}
              </div>
            </div>
          </div>

          {/* Location & Network */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <div className="px-2 py-1.5 bg-muted/5 border border-border/10">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[9px] text-muted-foreground">
                  Location
                </span>
              </div>
              <div className="text-xs font-medium text-foreground truncate">
                {location}
              </div>
            </div>
            <div className="px-2 py-1.5 bg-muted/5 border border-border/10">
              <div className="flex items-center gap-1">
                <Network className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[9px] text-muted-foreground">ASN</span>
              </div>
              <div className="text-xs font-medium text-foreground truncate">
                {asn}
              </div>
            </div>
          </div>

          {/* TLP Distribution */}
          {Object.keys(tlpCounts).length > 0 && (
            <div className="flex items-center gap-2 mb-2 text-[9px]">
              <span className="text-muted-foreground">TLP:</span>
              {Object.entries(tlpCounts).map(([tlp, count]) => (
                <span
                  key={tlp}
                  className={`px-1.5 py-0.5 border ${tlp === "white" ? "bg-gray-500/10 text-gray-500 border-gray-500/30" : "bg-green-500/10 text-green-500 border-green-500/30"}`}
                >
                  {tlp.toUpperCase()} ({count})
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          {uniqueTags.length > 0 && (
            <div className="mb-2">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Tags ({uniqueTags.length})
              </div>
              <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto custom-scrollbar">
                {uniqueTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Malware Families */}
          {uniqueMalware.length > 0 && (
            <div className="mb-2">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Malware Families ({uniqueMalware.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {uniqueMalware.slice(0, 6).map((malware, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/30"
                  >
                    {malware}
                  </span>
                ))}
                {uniqueMalware.length > 6 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{uniqueMalware.length - 6}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* MITRE ATT&CK */}
          {uniqueAttacks.length > 0 && (
            <div className="mb-2">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                MITRE ATT&CK ({uniqueAttacks.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {uniqueAttacks.slice(0, 5).map((attack, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/30"
                  >
                    {attack}
                  </span>
                ))}
                {uniqueAttacks.length > 5 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{uniqueAttacks.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mt-2 pt-2 border-t border-border/20">
            <div className="flex gap-1 mb-2 border-b border-border/20">
              {[
                { id: "pulses", label: "Pulses", count: pulses.length },
                { id: "dns", label: "DNS", count: indicatorCounts.dns },
                { id: "urls", label: "URLs", count: indicatorCounts.urls },
                { id: "files", label: "Files", count: indicatorCounts.files },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-2 py-1 text-[9px] font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-b border-blue-500 text-blue-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label} ({formatCount(tab.count)})
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
              {activeTab === "pulses" && (
                <div className="divide-y divide-border/10">
                  {pulses.length > 0 ? (
                    pulses.slice(0, 10).map((pulse: any, idx: number) => (
                      <div
                        key={idx}
                        className="py-2 px-1 hover:bg-muted/5 transition-colors cursor-pointer"
                        onClick={() =>
                          window.open(
                            `https://otx.alienvault.com/pulse/${pulse.id}`,
                            "_blank",
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-medium text-foreground truncate">
                              {pulse.name}
                            </div>
                            <div className="text-[8px] text-muted-foreground mt-0.5 line-clamp-2">
                              {pulse.description || "No description"}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[8px] text-muted-foreground/60">
                              <span className="flex items-center gap-0.5">
                                <Calendar className="h-2 w-2" />
                                {formatDate(pulse.modified || pulse.created)}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Database className="h-2 w-2" />
                                {pulse.indicator_count || 0} IOCs
                              </span>
                              {pulse.TLP && (
                                <span className="px-1 py-0.5 bg-muted/30 uppercase">
                                  {pulse.TLP}
                                </span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/40 flex-shrink-0" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[9px] text-muted-foreground">
                      No pulses found
                    </div>
                  )}
                  {pulses.length > 10 && (
                    <div className="text-center py-2 text-[9px] text-muted-foreground">
                      +{pulses.length - 10} more pulses
                    </div>
                  )}
                </div>
              )}

              {activeTab === "dns" && (
                <div className="text-center py-8">
                  <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-[10px] text-muted-foreground">
                    Passive DNS Records
                  </p>
                  <p className="mt-1 text-[9px] text-muted-foreground/60">
                    {formatCount(indicatorCounts.dns)} domains observed
                  </p>
                  <div className="mt-3 p-2 bg-blue-500/5 border border-blue-500/20 text-[9px] text-muted-foreground">
                    <Info className="h-3 w-3 inline mr-1 text-blue-500/50" />
                    Detailed DNS records available on OTX website
                  </div>
                </div>
              )}

              {activeTab === "urls" && (
                <div className="text-center py-8">
                  <Link className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-[10px] text-muted-foreground">
                    URL Indicators
                  </p>
                  <p className="mt-1 text-[9px] text-muted-foreground/60">
                    {formatCount(indicatorCounts.urls)} URLs observed
                  </p>
                  <div className="mt-3 p-2 bg-blue-500/5 border border-blue-500/20 text-[9px] text-muted-foreground">
                    <Info className="h-3 w-3 inline mr-1 text-blue-500/50" />
                    Detailed URL list available on OTX website
                  </div>
                </div>
              )}

              {activeTab === "files" && (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-[10px] text-muted-foreground">
                    Malware Samples
                  </p>
                  <p className="mt-1 text-[9px] text-muted-foreground/60">
                    {formatCount(indicatorCounts.files)} file hashes observed
                  </p>
                  <div className="mt-3 p-2 bg-blue-500/5 border border-blue-500/20 text-[9px] text-muted-foreground">
                    <Info className="h-3 w-3 inline mr-1 text-blue-500/50" />
                    Detailed file hashes available on OTX website
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* References */}
          {references.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/20">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                References ({references.length})
              </div>
              <div className="space-y-0.5 max-h-[80px] overflow-y-auto custom-scrollbar">
                {references.slice(0, 3).map((ref: string, idx: number) => (
                  <a
                    key={idx}
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[9px] text-blue-500/70 hover:text-blue-500 truncate"
                  >
                    {ref}
                  </a>
                ))}
                {references.length > 3 && (
                  <span className="text-[9px] text-muted-foreground/50">
                    +{references.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* View Full Report Button */}
          <button
            onClick={() =>
              window.open(
                `https://otx.alienvault.com/indicator/ip/${data.indicator}`,
                "_blank",
              )
            }
            className="w-full mt-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[10px] font-medium hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View Full Report on OTX
          </button>
        </div>
      )}
    </div>
  );
}
