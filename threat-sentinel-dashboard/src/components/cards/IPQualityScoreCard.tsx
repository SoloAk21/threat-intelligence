// src/components/cards/IPQualityScoreCard.tsx
import { useState } from "react";
import {
  Shield,
  MapPin,
  Server,
  Wifi,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  Mail,
  CreditCard,
  AlertCircle,
  Globe,
} from "lucide-react";
import type { IPQualityScoreData } from "@/types/threat";

export function IPQualityScoreCard({ data }: { data: IPQualityScoreData }) {
  const [expanded, setExpanded] = useState(false);

  const hasError = data.raw?.success === false;
  const errorMessage = data.raw?.message || "";

  if (hasError) {
    return (
      <div className="bg-card border-l-2 border-purple-500/60">
        <div className="px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-purple-500/70" />
            <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
              IPQS
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
            Error
          </span>
        </div>
        <div className="p-3 text-center">
          <CreditCard className="h-6 w-6 mx-auto mb-2 text-yellow-500/50" />
          <p className="text-[10px] text-muted-foreground mb-2">
            {errorMessage || "Insufficient credits"}
          </p>
          <button
            onClick={() =>
              window.open(
                "https://www.ipqualityscore.com/create-account",
                "_blank",
              )
            }
            className="text-[9px] text-purple-500 hover:text-purple-400"
          >
            Get API Credits →
          </button>
        </div>
      </div>
    );
  }

  const fraudScore = data.fraud_score || 0;
  const isVPN = data.vpn || false;
  const isProxy = data.proxy || false;
  const isTor = data.tor || false;
  const isBlacklisted = data.recent_abuse || false;

  const getRiskColor = () => {
    if (fraudScore >= 75) return "text-red-500";
    if (fraudScore >= 50) return "text-orange-500";
    if (fraudScore >= 25) return "text-yellow-500";
    return "text-green-500";
  };

  const getRiskBg = () => {
    if (fraudScore >= 75) return "bg-red-500/10 border-red-500/30";
    if (fraudScore >= 50) return "bg-orange-500/10 border-orange-500/30";
    if (fraudScore >= 25) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-green-500/10 border-green-500/30";
  };

  const getRiskLevel = () => {
    if (fraudScore >= 75) return "Critical";
    if (fraudScore >= 50) return "High";
    if (fraudScore >= 25) return "Medium";
    return "Low";
  };

  const riskColor = getRiskColor();
  const riskBg = getRiskBg();
  const riskLevel = getRiskLevel();

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

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-purple-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            IPQS
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          Score: {fraudScore}
        </span>

        <div className="flex items-center gap-1 ml-auto">
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 border ${riskBg} ${riskColor}`}
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
              <span className="text-muted-foreground">ISP:</span>
              <span className="text-foreground/80 truncate max-w-[180px]">
                {data.isp || data.raw?.isp || "Unknown"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {data.raw?.country || "Unknown"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://www.ipqualityscore.com/ip-reputation-check/${data.raw?.ip || ""}`,
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
          {/* Fraud Score Bar */}
          <div className="flex items-center gap-3 mb-2 pb-2 border-b border-border/20">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-1">
                <AlertCircle
                  className={`h-3.5 w-3.5 ${fraudScore >= 50 ? "text-red-500" : "text-yellow-500"}`}
                />
                <span className="text-[10px] text-muted-foreground">
                  Fraud Score
                </span>
              </div>
              <div className="flex-1 h-2 bg-muted/30 rounded-full max-w-[200px]">
                <div
                  className={`h-full rounded-full ${fraudScore >= 75 ? "bg-red-500" : fraudScore >= 50 ? "bg-orange-500" : fraudScore >= 25 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${fraudScore}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${riskColor}`}>
                {fraudScore}/100
              </span>
            </div>
          </div>

          {/* Security Indicators Grid */}
          <div className="grid grid-cols-4 gap-0.5 mb-2">
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
            <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded text-center">
              <Mail
                className={`h-3 w-3 mx-auto mb-0.5 ${isBlacklisted ? "text-red-500" : "text-green-500"}`}
              />
              <div className="text-[8px] font-medium text-muted-foreground uppercase">
                Spam
              </div>
              <div
                className={`text-[9px] font-bold ${isBlacklisted ? "text-red-500" : "text-green-500"}`}
              >
                {isBlacklisted ? "YES" : "NO"}
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
                  {data.raw?.country || "N/A"}
                </span>
              </div>
              <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                <MapPin className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                  City
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {data.raw?.city || "N/A"}
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
                <Server className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                  ISP
                </span>
                <span className="text-[10px] font-medium text-foreground truncate ml-1">
                  {data.isp || data.raw?.isp || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* View Report Button */}
          <button
            onClick={() =>
              window.open(
                `https://www.ipqualityscore.com/ip-reputation-check/${data.raw?.ip || ""}`,
                "_blank",
              )
            }
            className="w-full mt-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-500 text-[10px] font-medium hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Full Report on IPQS
          </button>
        </div>
      )}
    </div>
  );
}
