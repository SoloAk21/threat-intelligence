// src/components/cards/CensysCard.tsx
import { useState } from "react";
import {
  Shield,
  MapPin,
  Building2,
  Globe,
  Server,
  Network,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wifi,
  AlertCircle,
  Database,
} from "lucide-react";
import type { CensysData } from "@/types/threat";

export function CensysCard({ data }: { data: CensysData }) {
  const [expanded, setExpanded] = useState(false);
  const [whoisExpanded, setWhoisExpanded] = useState(false);

  const hasError = !data.raw?.result?.resource;
  const resource = data.raw?.result?.resource;
  const location = resource?.location;
  const as = resource?.autonomous_system;
  const whois = resource?.whois;
  const dns = resource?.dns;

  if (hasError || !resource) {
    return (
      <div className="bg-card border-l-2 border-green-500/60">
        <div className="px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-green-500/70" />
            <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
              Censys
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
            Config Required
          </span>
        </div>
        <div className="p-3 text-center">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-yellow-500/50" />
          <p className="text-[10px] text-muted-foreground mb-2">
            API credentials required
          </p>
          <button
            onClick={() =>
              window.open("https://search.censys.io/account/api", "_blank")
            }
            className="text-[9px] text-green-500 hover:text-green-400"
          >
            Get API Credentials →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-l-2 border-green-500/60">
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
            background: rgba(34, 197, 94, 0.2);
            border-radius: 0;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(34, 197, 94, 0.4);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(34, 197, 94, 0.2) transparent;
          }
        `}
      </style>

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 border-b border-border/20 flex items-center gap-2 bg-muted/5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-green-500/70" />
          <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
            Censys
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
          {data.services?.length || 0} services
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
              <span className="text-muted-foreground">ASN:</span>
              <span className="text-foreground/80">AS{as?.asn || "N/A"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {location?.country || "Unknown"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://search.censys.io/hosts/${resource.ip}`,
                  "_blank",
                );
              }}
              className="text-green-500/70 hover:text-green-500 flex items-center gap-0.5"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              <span>View</span>
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="p-3">
          {/* IP & Hostname */}
          <div className="mb-2 pb-2 border-b border-border/20">
            <code className="text-sm font-mono font-medium text-foreground">
              {resource.ip}
            </code>
            {dns?.names && dns.names.length > 0 && (
              <div className="text-[9px] text-muted-foreground mt-0.5">
                {dns.names[0]}
              </div>
            )}
          </div>

          {/* Location Grid */}
          {location && (
            <div className="grid grid-cols-2 gap-0.5 mb-2">
              <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
                <div className="text-[8px] font-medium text-muted-foreground uppercase">
                  Country
                </div>
                <div className="text-[10px] font-medium text-foreground truncate">
                  {location.country || "N/A"}
                </div>
              </div>
              <div className="px-1 py-1.5 bg-muted/5 border border-border/10 rounded">
                <div className="text-[8px] font-medium text-muted-foreground uppercase">
                  City
                </div>
                <div className="text-[10px] font-medium text-foreground truncate">
                  {location.city || "N/A"}
                </div>
              </div>
            </div>
          )}

          {/* ASN Details */}
          {as && (
            <div className="space-y-0.5 mb-2">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-0.5">
                Network
              </div>
              <div className="space-y-0">
                <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                  <Network className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                    ASN
                  </span>
                  <span className="text-[10px] font-medium text-foreground truncate ml-1">
                    AS{as.asn}
                  </span>
                </div>
                <div className="flex items-center py-0.5 px-1 hover:bg-muted/5 transition-colors rounded">
                  <Building2 className="h-3 w-3 text-muted-foreground/40 mr-1.5 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground w-12 flex-shrink-0">
                    Name
                  </span>
                  <span className="text-[10px] font-medium text-foreground truncate ml-1">
                    {as.name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Services */}
          {data.services && data.services.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/20">
              <div className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
                Open Services
              </div>
              <div className="flex flex-wrap gap-1">
                {data.services.slice(0, 6).map((service, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 bg-muted/30 text-foreground border border-border/30"
                  >
                    {service.port || service.service_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* View Report Button */}
          <button
            onClick={() =>
              window.open(
                `https://search.censys.io/hosts/${resource.ip}`,
                "_blank",
              )
            }
            className="w-full mt-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-500 text-[10px] font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Full Report on Censys
          </button>
        </div>
      )}
    </div>
  );
}
