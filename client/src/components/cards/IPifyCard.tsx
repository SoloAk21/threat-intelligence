// src/components/cards/IPifyCard.tsx
import { useState } from "react";
import {
  Globe,
  Shield,
  MapPin,
  Server,
  Wifi,
  Eye,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Lock,
  Network,
} from "lucide-react";
import type { IPifyData } from "@/types/threat";

export function IPifyCard({ data }: { data: IPifyData }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isProxy = data.proxy?.proxy || false;
  const isVPN = data.proxy?.vpn || false;
  const isTor = data.proxy?.tor || false;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskLevel = () => {
    if (isTor)
      return {
        level: "TOR",
        color: "text-red-500",
        bg: "bg-red-500/10 border-red-500/30",
      };
    if (isVPN)
      return {
        level: "VPN",
        color: "text-orange-500",
        bg: "bg-orange-500/10 border-orange-500/30",
      };
    if (isProxy)
      return {
        level: "Proxy",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10 border-yellow-500/30",
      };
    return {
      level: "Clean",
      color: "text-green-500",
      bg: "bg-green-500/10 border-green-500/30",
    };
  };

  const risk = getRiskLevel();

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
          <Globe className="h-3 w-3 text-indigo-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            IPify
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          {data.domains?.length || 0} domains
        </span>

        <div className="flex items-center gap-1 ml-auto">
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 border ${risk.bg} ${risk.color}`}
          >
            {risk.level}
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
              <span className="text-muted-foreground">ISP:</span>
              <span className="text-foreground/80 truncate max-w-[200px]">
                {data.isp || "Unknown"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {data.location?.country || "Unknown"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://www.ipify.org/`, "_blank");
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
          {/* IP Address Bar */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/20">
            <code className="text-sm font-mono font-medium text-foreground flex-1">
              {data.ip}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-1 hover:bg-muted/30 transition-colors rounded"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground/50" />
              )}
            </button>
          </div>

          {/* Security Indicators Grid */}
          <div className="grid grid-cols-3 gap-0.5 mb-2">
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded text-center">
              <Wifi
                className={`h-3 w-3 mx-auto mb-0.5 ${isVPN ? "text-orange-500" : "text-green-500"}`}
              />
              <div className="text-[8px] font-medium text-muted-foreground uppercase">
                VPN
              </div>
              <div
                className={`text-[9px] font-bold ${isVPN ? "text-orange-500" : "text-green-500"}`}
              >
                {isVPN ? "YES" : "NO"}
              </div>
            </div>
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded text-center">
              <Eye
                className={`h-3 w-3 mx-auto mb-0.5 ${isProxy ? "text-yellow-500" : "text-green-500"}`}
              />
              <div className="text-[8px] font-medium text-muted-foreground uppercase">
                Proxy
              </div>
              <div
                className={`text-[9px] font-bold ${isProxy ? "text-yellow-500" : "text-green-500"}`}
              >
                {isProxy ? "YES" : "NO"}
              </div>
            </div>
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded text-center">
              <Lock
                className={`h-3 w-3 mx-auto mb-0.5 ${isTor ? "text-red-500" : "text-green-500"}`}
              />
              <div className="text-[8px] font-medium text-muted-foreground uppercase">
                TOR
              </div>
              <div
                className={`text-[9px] font-bold ${isTor ? "text-red-500" : "text-green-500"}`}
              >
                {isTor ? "YES" : "NO"}
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
                  {data.location?.country || "N/A"}
                </span>
              </div>
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <MapPin className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                  City
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {data.location?.city || "N/A"}
                </span>
              </div>
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <MapPin className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                  Region
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {data.location?.region || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Network Details */}
          <div className="space-y-0.5 mb-2">
            <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-0.5">
              Network
            </div>
            <div className="space-y-0">
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <Server className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                  ISP
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {data.isp || "N/A"}
                </span>
              </div>
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <Network className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                  ASN
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  AS{data.as?.asn || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Domains */}
          {data.domains && data.domains.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/20">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Domains ({data.domains.length})
              </div>
              <div className="max-h-[80px] overflow-y-auto custom-scrollbar">
                {data.domains.slice(0, 5).map((domain, idx) => (
                  <div
                    key={idx}
                    className="text-[9px] font-mono text-foreground/80 truncate py-0.5"
                  >
                    {domain}
                  </div>
                ))}
                {data.domains.length > 5 && (
                  <div className="text-[8px] text-muted-foreground">
                    +{data.domains.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View Report Button */}
          <button
            onClick={() => window.open(`https://www.ipify.org/`, "_blank")}
            className="w-full mt-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-[10px] font-medium hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Try IPify API
          </button>
        </div>
      )}
    </div>
  );
}
