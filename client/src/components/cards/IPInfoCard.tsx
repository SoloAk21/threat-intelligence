// src/components/cards/IPInfoCard.tsx
import { useState } from "react";
import {
  Globe,
  MapPin,
  Server,
  Network,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building2,
  Activity,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import type { IPInfoData } from "@/types/threat";

export function IPInfoCard({ data }: { data: IPInfoData }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const geo = data.geo || {};
  const as = data.as || {};

  const copyIP = () => {
    navigator.clipboard.writeText(data.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Globe className="h-3 w-3 text-blue-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            IPinfo
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          {data.is_hosting ? "Hosting" : "Residential"}
        </span>

        <div className="flex items-center gap-1 ml-auto">
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
              <span className="text-muted-foreground">Org:</span>
              <span className="text-foreground/80 truncate max-w-[180px]">
                {as.name || data.org || "Unknown"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {geo.country || data.country || "Unknown"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://ipinfo.io/${data.ip}`, "_blank");
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
          {/* IP Address Bar */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/20">
            <code className="text-sm font-mono font-medium text-foreground flex-1">
              {data.ip}
            </code>
            <button
              onClick={copyIP}
              className="p-1 hover:bg-muted/30 transition-colors rounded"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground/50" />
              )}
            </button>
          </div>

          {/* Hostname */}
          {data.hostname && (
            <div className="mb-2 text-[9px] text-muted-foreground">
              Hostname: <span className="font-mono">{data.hostname}</span>
            </div>
          )}

          {/* Security Indicators */}
          <div className="grid grid-cols-4 gap-0.5 mb-2">
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded text-center">
              <Server
                className={`h-3 w-3 mx-auto mb-0.5 ${data.is_hosting ? "text-yellow-500" : "text-green-500"}`}
              />
              <div className="text-[8px] font-medium text-muted-foreground uppercase">
                Hosting
              </div>
              <div
                className={`text-[9px] font-bold ${data.is_hosting ? "text-yellow-500" : "text-green-500"}`}
              >
                {data.is_hosting ? "YES" : "NO"}
              </div>
            </div>
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded text-center">
              <Eye
                className={`h-3 w-3 mx-auto mb-0.5 ${data.is_anonymous ? "text-red-500" : "text-green-500"}`}
              />
              <div className="text-[8px] font-medium text-muted-foreground uppercase">
                Anon
              </div>
              <div
                className={`text-[9px] font-bold ${data.is_anonymous ? "text-red-500" : "text-green-500"}`}
              >
                {data.is_anonymous ? "YES" : "NO"}
              </div>
            </div>
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded text-center">
              <Activity
                className={`h-3 w-3 mx-auto mb-0.5 ${data.is_anycast ? "text-blue-500" : "text-muted-foreground"}`}
              />
              <div className="text-[8px] font-medium text-muted-foreground uppercase">
                Anycast
              </div>
              <div
                className={`text-[9px] font-bold ${data.is_anycast ? "text-blue-500" : "text-muted-foreground"}`}
              >
                {data.is_anycast ? "YES" : "NO"}
              </div>
            </div>
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded text-center">
              <Smartphone
                className={`h-3 w-3 mx-auto mb-0.5 ${data.is_mobile ? "text-cyan-500" : "text-muted-foreground"}`}
              />
              <div className="text-[8px] font-medium text-muted-foreground uppercase">
                Mobile
              </div>
              <div
                className={`text-[9px] font-bold ${data.is_mobile ? "text-cyan-500" : "text-muted-foreground"}`}
              >
                {data.is_mobile ? "YES" : "NO"}
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-0.5 mb-2">
            <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-0.5">
              Geolocation
            </div>
            <div className="space-y-0">
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <MapPin className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                  Country
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {geo.country || data.country || "N/A"}
                </span>
              </div>
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <MapPin className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                  City
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {geo.city || data.city || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Network Details */}
          <div className="space-y-0.5">
            <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-0.5">
              Network
            </div>
            <div className="space-y-0">
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <Building2 className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                  Org
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {as.name || data.org || "N/A"}
                </span>
              </div>
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <Network className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                  ASN
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {as.asn || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* View Report Button */}
          <button
            onClick={() =>
              window.open(`https://ipinfo.io/${data.ip}`, "_blank")
            }
            className="w-full mt-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[10px] font-medium hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Full Report on IPinfo
          </button>
        </div>
      )}
    </div>
  );
}
