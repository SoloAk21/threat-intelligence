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

  const getStatusColor = () => {
    if (isMalicious) return "text-red-500";
    if (reputationHits > 0) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusBg = () => {
    if (isMalicious) return "bg-red-500/10 border-red-500/30";
    if (reputationHits > 0) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-green-500/10 border-green-500/30";
  };

  const getStatus = () => {
    if (isMalicious) return "Malicious";
    if (reputationHits > 0) return "Suspicious";
    return "Clean";
  };

  const statusColor = getStatusColor();
  const statusBg = getStatusBg();
  const status = getStatus();

  return (
    <div className="bg-card border-l-2 border-indigo-500/60">
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
            background: rgba(99, 102, 241, 0.2);
            border-radius: 0;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(99, 102, 241, 0.4);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(99, 102, 241, 0.2) transparent;
          }
        `}
      </style>

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-indigo-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            InQuest
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          {reputationHits} hits
        </span>

        <div className="flex items-center gap-1 ml-auto">
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 border ${statusBg} ${statusColor}`}
          >
            {status}
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
              className="text-indigo-500/70 hover:text-indigo-500 flex items-center gap-0.5"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              <span>View</span>
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="p-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-0.5 mb-2">
            <div className="px-2 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3 text-indigo-500" />
                <span className="text-[9px] font-medium text-muted-foreground uppercase">
                  Hits
                </span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {reputationHits}
              </div>
            </div>
            <div className="px-2 py-1.5 bg-muted/5 border border-border/10 rounded">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-indigo-500" />
                <span className="text-[9px] font-medium text-muted-foreground uppercase">
                  Sources
                </span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {sources.length}
              </div>
            </div>
          </div>

          {/* Sources List */}
          {sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/20">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Threat Sources
              </div>
              <div className="space-y-1 max-h-[150px] overflow-y-auto custom-scrollbar">
                {sources.slice(0, 5).map((source, idx) => (
                  <div
                    key={idx}
                    className="px-2 py-1.5 bg-muted/5 border border-border/10 rounded"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-foreground capitalize">
                        {source.source}
                      </span>
                      <span className="text-[8px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-2 w-2" />
                        {source.date
                          ? new Date(source.date).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="text-[8px] text-muted-foreground mt-1 font-mono">
                      {source.data} | AS{source.derived}
                    </div>
                  </div>
                ))}
                {sources.length > 5 && (
                  <div className="text-center text-[8px] text-muted-foreground">
                    +{sources.length - 5} more sources
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Data State */}
          {!hasData && sources.length === 0 && (
            <div className="text-center py-6">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-[10px] text-muted-foreground">
                No threat intelligence found
              </p>
            </div>
          )}

          {/* View Report Button */}
          <button
            onClick={() =>
              window.open(
                `https://labs.inquest.net/ip/${sources[0]?.data || "search"}`,
                "_blank",
              )
            }
            className="w-full mt-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-[10px] font-medium hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View on InQuest Labs
          </button>
        </div>
      )}
    </div>
  );
}
