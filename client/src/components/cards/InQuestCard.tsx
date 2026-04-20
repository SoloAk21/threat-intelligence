// src/components/cards/InQuestCard.tsx
import { useState } from "react";
import {
  Shield,
  Database,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Calendar,
  AlertCircle,
} from "lucide-react";
import type { InQuestData } from "@/types/threat";

export function InQuestCard({ data }: { data: InQuestData }) {
  const [expanded, setExpanded] = useState(false);

  const hasData =
    data.reputation_hits !== undefined && data.reputation_hits > 0;
  const isMalicious = data.is_malicious || false;
  const reputationHits = data.reputation_hits || 0;
  const sources = data.sources || [];
  const rawEntries = data.raw || [];

  const getStatusColorClass = () => {
    if (isMalicious) return "text-risk-critical";
    if (reputationHits > 0) return "text-risk-high";
    return "text-risk-low";
  };

  const getStatusBgClass = () => {
    if (isMalicious) return "bg-risk-critical/15 border-risk-critical/40";
    if (reputationHits > 0) return "bg-risk-high/15 border-risk-high/40";
    return "bg-risk-low/15 border-risk-low/40";
  };

  const getStatusBarClass = () => {
    if (isMalicious) return "bg-risk-critical";
    if (reputationHits > 0) return "bg-risk-high";
    return "bg-risk-low";
  };

  const getStatus = () => {
    if (isMalicious) return "Malicious";
    if (reputationHits > 0) return "Suspicious";
    return "Clean";
  };

  const statusColorClass = getStatusColorClass();
  const statusBgClass = getStatusBgClass();
  const status = getStatus();

  return (
    <div className="bg-surface-0 border-l-4 border-brand-primary shadow-md">
      {/* Header Button - Collapsible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="group w-full px-4 py-3 border-b border-border flex items-center gap-3 bg-gradient-to-r from-brand-primary/5 via-surface-1 to-surface-1 hover:from-brand-primary/10 hover:via-surface-2 hover:to-surface-2 transition-all duration-200 cursor-pointer text-left"
      >
        <div className="flex items-center justify-center w-7 h-7 bg-brand-primary/15 border border-brand-primary/30">
          <Shield className="h-3.5 w-3.5 text-brand-primary" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-wide text-foreground uppercase">
            InQuest
          </span>
          <span className="text-[9px] font-mono text-brand-primary-dark bg-brand-primary/10 px-1.5 py-0.5 border border-brand-primary/20">
            {reputationHits} hits
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 w-20 bg-muted/30">
              <div
                className={`h-full ${getStatusBarClass()} transition-all duration-300`}
                style={{ width: `${Math.min(reputationHits, 100)}%` }}
              />
            </div>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 border ${statusBgClass} ${statusColorClass} uppercase tracking-wide`}
            >
              {status}
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
              <Database className="h-3 w-3 text-brand-primary/60" />
              <span className="text-muted-foreground">Sources:</span>
              <span className="text-foreground/80">{sources.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://labs.inquest.net/ip/${sources[0]?.data || "search"}`,
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
              <Activity className="h-4 w-4 text-brand-primary" />
              <span className="text-[10px] font-bold text-brand-primary-dark uppercase tracking-wider">
                InQuest Threat Intelligence
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Deep file analysis and threat reputation from InQuest Labs
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-px bg-brand-primary/10 border border-brand-primary/20">
            <div className="px-3 py-2 bg-surface-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Database className="h-3 w-3 text-brand-primary" />
                <span className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                  Reputation Hits
                </span>
              </div>
              <div className="text-xl font-bold text-foreground">
                {reputationHits}
              </div>
            </div>
            <div className="px-3 py-2 bg-surface-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Activity className="h-3 w-3 text-brand-primary" />
                <span className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                  Threat Sources
                </span>
              </div>
              <div className="text-xl font-bold text-foreground">
                {sources.length}
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div
            className={`p-3 border ${statusBgClass} flex items-center gap-3`}
          >
            <div className={`w-2 h-8 ${getStatusBarClass()}`} />
            <div>
              <div className={`text-[11px] font-bold ${statusColorClass}`}>
                {status} Status
              </div>
              <div className="text-[9px] text-muted-foreground">
                {isMalicious
                  ? "This indicator has been flagged as malicious by InQuest threat intelligence"
                  : reputationHits > 0
                    ? "This indicator has suspicious reputation hits requiring investigation"
                    : "No malicious reputation found in InQuest database"}
              </div>
            </div>
          </div>

          {/* Sources List */}
          {sources.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-brand-primary/5 border-l-4 border-brand-primary">
                <Database className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Threat Sources ({sources.length})
                </span>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                {sources.slice(0, 5).map((source, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-surface-1 border-l-2 border-brand-primary/40 hover:bg-brand-primary/5 hover:border-l-4 transition-all duration-150"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-foreground capitalize">
                        {source.source}
                      </span>
                      <span className="text-[8px] font-mono text-muted-foreground/60 flex items-center gap-1 bg-brand-primary/5 px-1.5 py-0.5">
                        <Calendar className="h-2 w-2" />
                        {source.date
                          ? new Date(source.date).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-brand-primary/80 break-all">
                      {source.data}
                    </div>
                    <div className="text-[8px] text-muted-foreground mt-1">
                      AS{source.derived}
                    </div>
                  </div>
                ))}
                {sources.length > 5 && (
                  <div className="text-center text-[9px] text-muted-foreground py-2 bg-brand-primary/5">
                    +{sources.length - 5} more sources
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Data Section */}
          {rawEntries.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-brand-secondary/5 border-l-4 border-brand-secondary">
                <AlertCircle className="h-3.5 w-3.5 text-brand-secondary" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Raw Intelligence Data
                </span>
              </div>
              <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-1">
                {rawEntries.slice(0, 3).map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-surface-1 border border-border/30"
                  >
                    <pre className="text-[8px] font-mono text-muted-foreground whitespace-pre-wrap break-all">
                      {JSON.stringify(entry, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Data State */}
          {!hasData && sources.length === 0 && (
            <div className="text-center py-6 bg-surface-1 border border-border/30">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-brand-primary/30" />
              <p className="text-[10px] text-muted-foreground">
                No threat intelligence found for this indicator
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t border-brand-primary/20">
            <button
              onClick={() =>
                window.open(
                  `https://labs.inquest.net/ip/${sources[0]?.data || "search"}`,
                  "_blank",
                )
              }
              className="flex-1 py-2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary-dark transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on InQuest Labs
            </button>
          </div>

          {/* Brand Footer */}
          <div className="text-center pt-2 border-t border-brand-primary/10">
            <span className="text-[8px] text-muted-foreground/60">
              Powered by{" "}
              <span className="text-brand-primary font-mono">InQuest</span> •
              Deep threat intelligence
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
