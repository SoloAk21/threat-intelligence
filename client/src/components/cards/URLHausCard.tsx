// src/components/cards/URLHausCard.tsx
import { useState } from "react";
import {
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Link2,
  Tag,
  Calendar,
} from "lucide-react";
import type { URLHausData } from "@/types/threat";

export function URLHausCard({ data }: { data: URLHausData }) {
  const [expanded, setExpanded] = useState(false);

  const isMalicious = data.is_malicious || false;
  const count = data.count || 0;
  const urls = data.urls || [];
  const threatTypes = data.threat_types || [];
  const tags = data.tags || [];

  return (
    <div className="bg-card border-l-2 border-orange-500/60">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.2); }
        `}
      </style>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Link2 className="h-3 w-3 text-orange-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            URLHaus
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          {count} URLs
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
            {threatTypes.length > 0 && (
              <span className="text-red-500">{threatTypes[0]}</span>
            )}
            {tags.length > 0 && (
              <span className="text-muted-foreground">{tags.length} tags</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://urlhaus.abuse.ch/`, "_blank");
            }}
            className="text-orange-500/70 hover:text-orange-500 flex items-center gap-0.5"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            <span>View</span>
          </button>
        </div>
      )}

      {expanded && (
        <div className="p-3">
          {/* Threat Types */}
          {threatTypes.length > 0 && (
            <div className="mb-2">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Threat Types
              </div>
              <div className="flex flex-wrap gap-1">
                {threatTypes.map((t, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/30"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-2">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Tags
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 bg-muted/30 text-muted-foreground border border-border/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* URLs List */}
          {urls.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/20">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Malicious URLs ({urls.length})
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                {urls.slice(0, 5).map((u, i) => (
                  <div
                    key={i}
                    className="px-2 py-1.5 bg-muted/5 border border-border/10"
                  >
                    <div className="text-[9px] text-foreground truncate">
                      {u.url}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[8px] text-muted-foreground/50">
                      <span className="flex items-center gap-0.5">
                        <Tag className="h-2 w-2" />
                        {u.threat}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-2 w-2" />
                        {u.date_added?.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => window.open(`https://urlhaus.abuse.ch/`, "_blank")}
            className="w-full mt-2 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-500 text-[10px] font-medium hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View on URLHaus
          </button>
        </div>
      )}
    </div>
  );
}
