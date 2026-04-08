// src/components/cards/SucuriCard.tsx
import { useState } from "react";
import {
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { SucuriData } from "@/types/threat";

export function SucuriCard({ data }: { data: SucuriData }) {
  const [expanded, setExpanded] = useState(false);

  const isMalicious = data.is_malicious || false;
  const status = data.status || "unknown";
  const blacklist = data.blacklist || {};
  const recommendations = data.recommendations || [];
  const malware = data.malware || [];

  const blacklistCount = Object.values(blacklist).filter(Boolean).length;

  return (
    <div className="bg-card border-l-2 border-blue-500/60">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); }
        `}
      </style>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Globe className="h-3 w-3 text-blue-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            Sucuri SiteCheck
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          {blacklistCount} blacklists
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 border ${isMalicious ? "bg-red-500/10 text-red-500 border-red-500/30" : "bg-green-500/10 text-green-500 border-green-500/30"}`}
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
            <span className="text-muted-foreground">Status: {status}</span>
            {blacklistCount > 0 && (
              <span className="text-red-500">{blacklistCount} blacklists</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://sitecheck.sucuri.net/`, "_blank");
            }}
            className="text-blue-500/70 hover:text-blue-500 flex items-center gap-0.5"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            <span>View</span>
          </button>
        </div>
      )}

      {expanded && (
        <div className="p-3">
          {/* Status */}
          <div className="flex items-center gap-2 mb-2">
            {isMalicious ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span
              className={`text-sm font-bold ${isMalicious ? "text-red-500" : "text-green-500"}`}
            >
              {status.toUpperCase()}
            </span>
          </div>

          {/* Blacklist Status */}
          <div className="mb-2">
            <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
              Blacklist Status
            </div>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(blacklist).map(([name, listed]) => (
                <div
                  key={name}
                  className="flex items-center justify-between px-2 py-1 bg-muted/5 border border-border/10"
                >
                  <span className="text-[9px] text-muted-foreground">
                    {name}
                  </span>
                  <span className={listed ? "text-red-500" : "text-green-500"}>
                    {listed ? "⚠ Listed" : "✓ Clean"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Malware Found */}
          {malware.length > 0 && (
            <div className="mb-2">
              <div className="text-[9px] font-semibold text-red-500/70 uppercase tracking-wider mb-1">
                Malware Detected ({malware.length})
              </div>
              <div className="space-y-0.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                {malware.map((m, i) => (
                  <div
                    key={i}
                    className="px-2 py-1 bg-red-500/5 border border-red-500/20 text-[9px] text-red-500"
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-2">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Recommendations
              </div>
              <div className="space-y-0.5">
                {recommendations.slice(0, 3).map((r, i) => (
                  <div key={i} className="text-[9px] text-muted-foreground">
                    • {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() =>
              window.open(`https://sitecheck.sucuri.net/`, "_blank")
            }
            className="w-full mt-2 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[10px] font-medium hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View Full Report
          </button>
        </div>
      )}
    </div>
  );
}
