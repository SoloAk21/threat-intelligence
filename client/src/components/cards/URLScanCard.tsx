// src/components/cards/URLScanCard.tsx
import { useState } from "react";
import {
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Server,
  Camera,
  AlertTriangle,
} from "lucide-react";
import type { URLScanData } from "@/types/threat";

export function URLScanCard({ data }: { data: URLScanData }) {
  const [expanded, setExpanded] = useState(false);

  const isMalicious = data.is_malicious || false;
  const score = data.score || 0;
  const verdicts = data.verdicts || {};
  const page = data.page || {};
  const stats = data.stats || {};

  const getScoreColor = () => {
    if (score >= 75) return "text-red-500";
    if (score >= 50) return "text-orange-500";
    if (score >= 25) return "text-yellow-500";
    return "text-green-500";
  };

  const getScoreBg = () => {
    if (score >= 75) return "bg-red-500/10 border-red-500/30";
    if (score >= 50) return "bg-orange-500/10 border-orange-500/30";
    if (score >= 25) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-green-500/10 border-green-500/30";
  };

  return (
    <div className="bg-card border-l-2 border-purple-500/60">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(147, 51, 234, 0.2); }
        `}
      </style>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Camera className="h-3 w-3 text-purple-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            URLScan.io
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          Score: {score}/100
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 border ${getScoreBg()} ${getScoreColor()}`}
          >
            {isMalicious ? "MALICIOUS" : "CLEAN"}
          </span>
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </div>
      </button>

      {!expanded && (
        <div className="px-3 py-2 flex items-center justify-between text-[9px]">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {page.domain || "N/A"}
            </span>
            <span className="text-muted-foreground">{page.ip || "N/A"}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(data.report_url, "_blank");
            }}
            className="text-purple-500/70 hover:text-purple-500 flex items-center gap-0.5"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            <span>View</span>
          </button>
        </div>
      )}

      {expanded && (
        <div className="p-3">
          {/* Score Bar */}
          <div className="flex items-center gap-3 mb-2 pb-2 border-b border-border/20">
            <div className="flex-1 h-2 bg-muted/30">
              <div
                className={`h-full ${score >= 50 ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold ${getScoreColor()}`}>
              {score}/100
            </span>
          </div>

          {/* Page Info */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <div className="px-2 py-1.5 bg-muted/5 border border-border/10">
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[9px] text-muted-foreground">Domain</span>
              </div>
              <div className="text-sm font-medium truncate">{page.domain}</div>
            </div>
            <div className="px-2 py-1.5 bg-muted/5 border border-border/10">
              <div className="flex items-center gap-1">
                <Server className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[9px] text-muted-foreground">IP</span>
              </div>
              <div className="text-sm font-medium truncate">{page.ip}</div>
            </div>
          </div>

          {/* Verdicts */}
          {Object.keys(verdicts).length > 0 && (
            <div className="mb-2">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Verdicts
              </div>
              <div className="space-y-0.5">
                {Object.entries(verdicts).map(([name, v]: [string, any]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between text-[9px]"
                  >
                    <span className="text-muted-foreground">{name}</span>
                    <span
                      className={
                        v.malicious ? "text-red-500" : "text-green-500"
                      }
                    >
                      {v.malicious ? "⚠ Malicious" : "✓ Clean"} ({v.score}/100)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 pt-1 border-t border-border/20 text-[9px]">
            <span className="text-muted-foreground">
              Resources: {stats.resourceStats?.count || 0}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Requests: {stats.requests?.total || 0}
            </span>
          </div>

          <button
            onClick={() => window.open(data.report_url, "_blank")}
            className="w-full mt-2 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-500 text-[10px] font-medium hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View Full Report
          </button>
        </div>
      )}
    </div>
  );
}
