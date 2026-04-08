// src/components/cards/VirusTotalCard.tsx
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Shield,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Filter,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { VirusTotalData } from "@/types/threat";

interface VendorResult {
  engine_name: string;
  category: string;
  result: string;
  method?: string;
}

export function VirusTotalCard({ data }: { data: VirusTotalData }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "malicious" | "suspicious" | "clean" | "unrated"
  >("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const stats = data.last_analysis_stats;
  const total =
    stats.malicious + stats.suspicious + stats.undetected + stats.harmless;
  const maliciousPercent = total > 0 ? (stats.malicious / total) * 100 : 0;

  const vendorResults = useMemo(() => {
    if (!data.last_analysis_results) return [];
    return Object.entries(data.last_analysis_results).map(
      ([name, value]: [string, any]) => ({
        engine_name: name,
        category: value.category || "undetected",
        result: value.result || value.category || "unrated",
        method: value.method,
      }),
    );
  }, [data.last_analysis_results]);

  const filteredVendors = useMemo(() => {
    let filtered = vendorResults;
    if (searchTerm) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.engine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.result.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (filterType !== "all") {
      filtered = filtered.filter((vendor) => {
        if (filterType === "malicious") return vendor.category === "malicious";
        if (filterType === "suspicious")
          return vendor.category === "suspicious";
        if (filterType === "clean") return vendor.category === "harmless";
        if (filterType === "unrated") return vendor.category === "undetected";
        return true;
      });
    }
    return filtered;
  }, [vendorResults, searchTerm, filterType]);

  const statsCount = {
    malicious: vendorResults.filter((v) => v.category === "malicious").length,
    suspicious: vendorResults.filter((v) => v.category === "suspicious").length,
    clean: vendorResults.filter((v) => v.category === "harmless").length,
    unrated: vendorResults.filter((v) => v.category === "undetected").length,
  };

  const getResultColor = (category: string) => {
    if (category === "malicious")
      return "text-red-500 bg-red-500/10 border-red-500/30";
    if (category === "suspicious")
      return "text-orange-500 bg-orange-500/10 border-orange-500/30";
    if (category === "harmless")
      return "text-green-500 bg-green-500/10 border-green-500/30";
    return "text-muted-foreground bg-muted/30 border-border/30";
  };

  const getResultText = (category: string) => {
    if (category === "malicious") return "MALICIOUS";
    if (category === "suspicious") return "SUSPICIOUS";
    if (category === "harmless") return "CLEAN";
    return "UNRATED";
  };

  const copyJarm = () => {
    navigator.clipboard.writeText(data.jarm || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filterOptions = [
    {
      type: "all",
      label: "All",
      count: vendorResults.length,
      color: "border-muted-foreground",
    },
    {
      type: "malicious",
      label: "Malicious",
      count: statsCount.malicious,
      color: "border-red-500",
    },
    {
      type: "suspicious",
      label: "Suspicious",
      count: statsCount.suspicious,
      color: "border-orange-500",
    },
    {
      type: "clean",
      label: "Clean",
      count: statsCount.clean,
      color: "border-green-500",
    },
    {
      type: "unrated",
      label: "Unrated",
      count: statsCount.unrated,
      color: "border-muted-foreground",
    },
  ];

  const topMaliciousVendors = vendorResults
    .filter((v) => v.category === "malicious")
    .slice(0, 3);

  return (
    <div className="bg-card border-l-2 border-purple-500/60">
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
            background: rgba(168, 85, 247, 0.2);
            border-radius: 0;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.4);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(168, 85, 247, 0.2) transparent;
          }
        `}
      </style>

      {/* Header - Clickable to expand/collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-purple-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            VirusTotal
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          {total}
        </span>

        <div className="flex items-center gap-2 ml-2">
          <span className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 bg-red-500"></span>
            <span className="text-[9px] text-red-500 font-medium">
              {stats.malicious}
            </span>
          </span>
          <span className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 bg-orange-500"></span>
            <span className="text-[9px] text-orange-500 font-medium">
              {stats.suspicious}
            </span>
          </span>
          <span className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 bg-green-500"></span>
            <span className="text-[9px] text-green-500 font-medium">
              {stats.harmless}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[9px] text-muted-foreground/50">
            {stats.malicious}/{total}
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
            {topMaliciousVendors.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Detected by:</span>
                {topMaliciousVendors.map((v, i) => (
                  <span key={i} className="text-red-500 font-medium">
                    {v.engine_name}
                    {i < topMaliciousVendors.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-green-500">No detections</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">AS{data.asn}</span>
            <span className="text-muted-foreground">{data.country}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://www.virustotal.com/gui/ip-address/${data.input || "search"}`,
                  "_blank",
                );
              }}
              className="text-purple-500/70 hover:text-purple-500 flex items-center gap-0.5"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              <span>View</span>
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="p-3">
          {/* Stats Bar */}
          <div className="flex items-center gap-3 mb-2 pb-2 border-b border-border/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500"></span>
                <span className="text-[10px] text-muted-foreground">
                  Malicious
                </span>
                <span className="text-[10px] font-bold text-red-500">
                  {stats.malicious}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-500"></span>
                <span className="text-[10px] text-muted-foreground">
                  Suspicious
                </span>
                <span className="text-[10px] font-bold text-orange-500">
                  {stats.suspicious}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500"></span>
                <span className="text-[10px] text-muted-foreground">Clean</span>
                <span className="text-[10px] font-bold text-green-500">
                  {stats.harmless}
                </span>
              </div>
            </div>
            <div className="flex-1 h-1.5 bg-muted/30 ml-auto max-w-[120px]">
              <div
                className="h-full bg-red-500"
                style={{ width: `${maliciousPercent}%` }}
              />
            </div>
          </div>

          {/* Search & Filter Row */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-3 py-1 text-[10px] bg-background/50 border border-border/30 focus:outline-none focus:border-purple-500/40"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3 w-3 text-muted-foreground/40" />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="px-2 py-1 text-[10px] border border-border/30 hover:bg-muted/10 flex items-center gap-1"
              >
                <Filter className="h-3 w-3" />
                <span className="capitalize">{filterType}</span>
                <span className="text-muted-foreground/50">
                  ({filteredVendors.length})
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showFilterDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilterDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-0.5 z-20 bg-card border border-border/30 min-w-[120px]">
                    {filterOptions.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => {
                          setFilterType(option.type as any);
                          setShowFilterDropdown(false);
                        }}
                        className={`
                          w-full px-2 py-1 text-[10px] text-left hover:bg-muted/10 flex items-center justify-between
                          ${filterType === option.type ? `border-l-2 ${option.color}` : ""}
                        `}
                      >
                        <span>{option.label}</span>
                        <span className="text-muted-foreground/50">
                          ({option.count})
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Two Column Grid Layout */}
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar border border-border/20 mb-2">
            {filteredVendors.length > 0 ? (
              <div className="divide-y divide-border/10">
                {filteredVendors.map((vendor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2 py-1 hover:bg-muted/5 transition-colors"
                  >
                    <span className="text-[10px] text-foreground/80 truncate flex-1">
                      {vendor.engine_name}
                    </span>
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.5 border ${getResultColor(
                        vendor.category,
                      )} flex-shrink-0 ml-2`}
                    >
                      {getResultText(vendor.category)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[10px] text-muted-foreground">
                No vendors found
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-2 text-[9px] text-muted-foreground">
            <span>
              Showing {filteredVendors.length} of {vendorResults.length}
            </span>
          </div>

          {/* Network Info */}
          <div className="flex items-center gap-3 pt-1 border-t border-border/20 text-[9px]">
            <span className="text-muted-foreground">AS{data.asn}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground truncate">
              {data.country}
            </span>
            {data.jarm && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <code className="font-mono text-foreground/70 truncate max-w-[120px]">
                    {data.jarm}
                  </code>
                  <button
                    onClick={copyJarm}
                    className="p-0.5 hover:bg-muted/30"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground/50" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* View Report Link */}
          <button
            onClick={() =>
              window.open(
                `https://www.virustotal.com/gui/ip-address/${data.input || "search"}`,
                "_blank",
              )
            }
            className="w-full mt-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-500 text-[10px] font-medium hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Full Report on VirusTotal
          </button>
        </div>
      )}
    </div>
  );
}
