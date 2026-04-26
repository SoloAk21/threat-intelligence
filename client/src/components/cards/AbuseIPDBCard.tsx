// src/components/cards/AbuseIPDBCard.tsx
import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Server,
  Globe,
  Calendar,
  Users,
  Flag,
  Clock,
  Building,
  MapPin,
  Activity,
} from "lucide-react";
import type { AbuseIPDBData } from "@/types/threat";

export function AbuseIPDBCard({ data }: { data: AbuseIPDBData }) {
  const [expanded, setExpanded] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);

  const score = data.abuseConfidenceScore || 0;
  const totalReports = data.totalReports || 0;
  const ipAddress = data.raw?.ipAddress || data.ipAddress || "Unknown";
  const isp = data.raw?.isp || data.isp || "Unknown";
  const usageType = data.raw?.usageType || data.usageType || "Unknown";
  const domain = data.raw?.domain || data.domain || "Unknown";
  const lastReportedAt = data.raw?.lastReportedAt;
  const numDistinctUsers = data.raw?.numDistinctUsers;
  const isWhitelisted = data.raw?.isWhitelisted || false;
  const isTor = data.raw?.isTor || false;
  const isPublic = data.raw?.isPublic !== false;
  const ipVersion = data.raw?.ipVersion || 4;
  const hostnames = data.raw?.hostnames || [];
  const reports = data.raw?.reports || data.reports || [];

  const categoryCounts: Record<string, number> = {};
  reports.forEach((report: any) => {
    if (report.categories) {
      report.categories.forEach((cat: number) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    }
  });

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const categoryNames: Record<number, string> = {
    1: "DNS Compromise",
    2: "DNS Poisoning",
    3: "Fraud Orders",
    4: "DDoS Attack",
    5: "FTP Brute-Force",
    6: "Ping of Death",
    7: "Phishing",
    8: "Fraud VoIP",
    9: "Open Proxy",
    10: "Web Spam",
    11: "Email Spam",
    12: "Blog Spam",
    13: "VPN IP",
    14: "Port Scan",
    15: "Hacking",
    16: "SQL Injection",
    17: "Spoofing",
    18: "Brute-Force",
    19: "Bad Web Bot",
    20: "Exploited Host",
    21: "Web App Attack",
    22: "SSH",
    23: "IoT Targeted",
  };

  const getScoreColor = () => {
    if (score >= 75) return "text-risk-critical";
    if (score >= 50) return "text-risk-high";
    if (score >= 25) return "text-risk-medium";
    return "text-risk-low";
  };

  const getScoreBg = () => {
    if (score >= 75) return "bg-risk-critical/10 border-risk-critical/30";
    if (score >= 50) return "bg-risk-high/10 border-risk-high/30";
    if (score >= 25) return "bg-risk-medium/10 border-risk-medium/30";
    return "bg-risk-low/10 border-risk-low/30";
  };

  const getRiskLevel = () => {
    if (score >= 75) return "CRITICAL";
    if (score >= 50) return "HIGH";
    if (score >= 25) return "MEDIUM";
    return "LOW";
  };

  const getCategoryColor = (category: number) => {
    const highRisk = [4, 7, 9, 14, 15, 16, 18, 20, 21, 22];
    const mediumRisk = [1, 2, 3, 5, 6, 8, 13, 17, 19, 23];
    if (highRisk.includes(category))
      return "bg-risk-critical/20 text-risk-critical border-risk-critical/30";
    if (mediumRisk.includes(category))
      return "bg-risk-high/20 text-risk-high border-risk-high/30";
    return "bg-brand-primary/20 text-brand-primary border-brand-primary/30";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return `${Math.round(diffHours)}h ago`;
    } else if (diffHours < 168) {
      return `${Math.round(diffHours / 24)}d ago`;
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const displayedReports = showAllReports ? reports : reports.slice(0, 5);

  return (
    <div className="bg-card border-l-2 border-risk-critical/60 transition-all duration-300 hover:border-risk-critical/80">
      <style>
        {`
          .abuse-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          .abuse-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .abuse-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(12, 183, 183, 0.2);
            border-radius: 0;
          }
          .abuse-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(12, 183, 183, 0.4);
          }
          .abuse-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(12, 183, 183, 0.2) transparent;
          }
        `}
      </style>

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-gradient-to-r from-risk-critical/5 to-transparent hover:from-risk-critical/10 transition-all duration-200"
      >
        <div className="flex items-center gap-1.5">
          <div className="p-0.5 bg-risk-critical/10">
            <Shield className="h-3 w-3 text-risk-critical" strokeWidth={2} />
          </div>
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            AbuseIPDB
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          {totalReports} reports
        </span>

        <div className="flex items-center gap-2 ml-2">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-20 bg-muted/30">
              <div
                className={`h-full ${
                  score >= 75
                    ? "bg-risk-critical"
                    : score >= 50
                      ? "bg-risk-high"
                      : score >= 25
                        ? "bg-risk-medium"
                        : "bg-risk-low"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-[9px] font-medium ${getScoreColor()}`}>
              {score}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {isTor && (
            <span className="text-[8px] px-1 py-0.5 bg-purple-500/10 text-purple-500 border border-purple-500/30">
              TOR
            </span>
          )}
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 border ${getScoreBg()} ${getScoreColor()}`}
          >
            {getRiskLevel()}
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
        <div className="px-3 py-2 flex items-center justify-between text-[9px] bg-brand-primary/3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">ISP:</span>
              <span className="text-foreground/80 truncate max-w-[180px]">
                {isp}
              </span>
            </div>
            {numDistinctUsers && (
              <div className="flex items-center gap-1">
                <Users className="h-2.5 w-2.5 text-brand-primary/40" />
                <span className="text-muted-foreground">
                  {numDistinctUsers} reporters
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" />
              {/* {countryCode} */}
            </span>
            {lastReportedAt && (
              <span className="text-muted-foreground/60 flex items-center gap-0.5">
                <Clock className="h-2 w-2" />
                {formatDate(lastReportedAt)}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://www.abuseipdb.com/check/${ipAddress}`,
                  "_blank",
                );
              }}
              className="text-risk-critical/70 hover:text-risk-critical flex items-center gap-0.5 transition-colors"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              <span>View</span>
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Confidence Score Bar */}
          <div className="flex items-center gap-3 pb-2 border-b border-border/20">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-1">
                <AlertTriangle
                  className={`h-3.5 w-3.5 ${score >= 50 ? "text-risk-critical" : "text-risk-medium"}`}
                />
                <span className="text-[10px] text-muted-foreground">
                  Abuse Confidence
                </span>
              </div>
              <div className="flex-1 h-2 bg-muted/30 max-w-[200px]">
                <div
                  className={`h-full ${
                    score >= 75
                      ? "bg-risk-critical"
                      : score >= 50
                        ? "bg-risk-high"
                        : score >= 25
                          ? "bg-risk-medium"
                          : "bg-risk-low"
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${getScoreColor()}`}>
                {score}%
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-0.5">
            <div className="px-1.5 py-1.5 bg-muted/5 border border-border/10">
              <div className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">
                Reports
              </div>
              <div className="text-sm font-bold tabular-nums text-foreground">
                {totalReports.toLocaleString()}
              </div>
            </div>
            <div className="px-1.5 py-1.5 bg-muted/5 border border-border/10">
              <div className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">
                Users
              </div>
              <div className="text-sm font-bold tabular-nums text-foreground">
                {numDistinctUsers?.toLocaleString() || "N/A"}
              </div>
            </div>
            <div className="px-1.5 py-1.5 bg-muted/5 border border-border/10">
              <div className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">
                IP Ver
              </div>
              <div className="text-sm font-bold tabular-nums text-foreground">
                IPv{ipVersion}
              </div>
            </div>
            <div className="px-1.5 py-1.5 bg-muted/5 border border-border/10">
              <div className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">
                Public
              </div>
              <div
                className={`text-sm font-bold ${isPublic ? "text-risk-low" : "text-risk-high"}`}
              >
                {isPublic ? "Yes" : "No"}
              </div>
            </div>
          </div>

          {/* Network Information */}
          <div>
            <div className="text-[9px] font-semibold text-brand-primary/70 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Server className="h-2.5 w-2.5" />
              Network Information
            </div>
            <div className="space-y-0">
              <div className="flex items-center py-0.5 px-1.5 hover:bg-brand-primary/5 transition-colors">
                <div className="flex items-center gap-2 flex-shrink-0 w-20">
                  <Building className="h-3 w-3 text-brand-primary/40" />
                  <span className="text-[10px] text-muted-foreground">ISP</span>
                </div>
                <span className="text-[10px] font-medium text-foreground truncate">
                  {isp}
                </span>
              </div>
              {domain !== "Unknown" && (
                <div className="flex items-center py-0.5 px-1.5 hover:bg-brand-primary/5 transition-colors">
                  <div className="flex items-center gap-2 flex-shrink-0 w-20">
                    <Globe className="h-3 w-3 text-brand-primary/40" />
                    <span className="text-[10px] text-muted-foreground">
                      Domain
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-foreground truncate">
                    {domain}
                  </span>
                </div>
              )}
              <div className="flex items-center py-0.5 px-1.5 hover:bg-brand-primary/5 transition-colors">
                <div className="flex items-center gap-2 flex-shrink-0 w-20">
                  <Flag className="h-3 w-3 text-brand-primary/40" />
                  <span className="text-[10px] text-muted-foreground">
                    Usage
                  </span>
                </div>
                <span className="text-[10px] font-medium text-foreground truncate">
                  {usageType}
                </span>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          {topCategories.length > 0 && (
            <div>
              <div className="text-[9px] font-semibold text-brand-primary/70 uppercase tracking-wider mb-1">
                Top Categories
              </div>
              <div className="flex flex-wrap gap-1">
                {topCategories.map(([cat, count]) => (
                  <span
                    key={cat}
                    className={`text-[9px] px-1.5 py-0.5 border ${getCategoryColor(parseInt(cat))}`}
                  >
                    {categoryNames[parseInt(cat)] || `Cat ${cat}`} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reports Section */}
          {reports.length > 0 && (
            <div className="pt-2 border-t border-border/20">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[9px] font-semibold text-brand-primary/70 uppercase tracking-wider">
                  Recent Reports ({reports.length})
                </div>
                {reports.length > 5 && (
                  <button
                    onClick={() => setShowAllReports(!showAllReports)}
                    className="text-[9px] text-brand-primary/70 hover:text-brand-primary transition-colors"
                  >
                    {showAllReports
                      ? "Show Less"
                      : `Show All (${reports.length})`}
                  </button>
                )}
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto abuse-scrollbar">
                {displayedReports.map((report: any, idx: number) => (
                  <div
                    key={idx}
                    className="px-2 py-1.5 bg-muted/5 border border-border/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[9px] text-foreground/80 truncate flex-1">
                        {report.comment || "No comment provided"}
                      </span>
                      <span className="text-[8px] text-muted-foreground/50 flex-shrink-0">
                        {formatDate(report.reportedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {report.categories && report.categories.length > 0 && (
                        <div className="flex flex-wrap gap-0.5">
                          {report.categories.map((cat: number, i: number) => (
                            <span
                              key={i}
                              className={`text-[7px] px-1 py-0.5 border ${getCategoryColor(cat)}`}
                              title={categoryNames[cat] || `Category ${cat}`}
                            >
                              {categoryNames[cat]?.slice(0, 6) || `C${cat}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-1">
            <button
              onClick={() =>
                window.open(
                  `https://www.abuseipdb.com/check/${ipAddress}`,
                  "_blank",
                )
              }
              className="flex-1 py-1.5 bg-risk-critical/10 border border-risk-critical/30 text-risk-critical text-[10px] font-medium hover:bg-risk-critical/20 transition-all duration-200 flex items-center justify-center gap-1.5 group"
            >
              <ExternalLink className="h-3 w-3 group-hover:scale-105 transition-transform" />
              View Full Report
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://www.abuseipdb.com/report/${ipAddress}`,
                  "_blank",
                )
              }
              className="flex-1 py-1.5 border border-border/30 hover:bg-brand-primary/10 text-[10px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5 group"
            >
              <AlertTriangle className="h-3 w-3 group-hover:scale-105 transition-transform" />
              Report This IP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
