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
  ChevronRight,
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

  // API credentials missing state
  if (hasError || !resource) {
    return (
      <div className="bg-surface-0 border-l-4 border-brand-primary shadow-md">
        <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-gradient-to-r from-brand-primary/5 via-surface-1 to-surface-1">
          <div className="flex items-center justify-center w-7 h-7 bg-brand-primary/15 border border-brand-primary/30">
            <Shield className="h-3.5 w-3.5 text-brand-primary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wide text-foreground uppercase">
              Censys
            </span>
            <span className="text-[9px] font-mono text-brand-primary-dark bg-brand-primary/10 px-1.5 py-0.5 border border-brand-primary/20">
              Config Required
            </span>
          </div>
        </div>
        <div className="p-6 text-center bg-surface-0">
          <AlertCircle className="h-8 w-8 mx-auto mb-3 text-brand-primary/30" />
          <p className="text-[11px] text-muted-foreground mb-3">
            API credentials required for Censys integration
          </p>
          <button
            onClick={() =>
              window.open("https://search.censys.io/account/api", "_blank")
            }
            className="inline-flex items-center gap-2 py-2 px-4 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary-dark transition-all duration-150 shadow-sm"
          >
            <ExternalLink className="h-3 w-3" />
            Get API Credentials
          </button>
        </div>
      </div>
    );
  }

  const serviceCount = data.services?.length || 0;

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
            Censys
          </span>
          <span className="text-[9px] font-mono text-brand-primary-dark bg-brand-primary/10 px-1.5 py-0.5 border border-brand-primary/20">
            {serviceCount} services
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 w-20 bg-muted/30">
              <div
                className="h-full bg-brand-primary transition-all duration-300"
                style={{ width: `${Math.min(serviceCount * 10, 100)}%` }}
              />
            </div>
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
              <Network className="h-3 w-3 text-brand-primary/60" />
              <span className="text-muted-foreground">ASN:</span>
              <span className="text-foreground/80 font-mono">
                AS{as?.asn || "N/A"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground font-mono text-[11px] flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 text-brand-primary/50" />
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
              <Database className="h-4 w-4 text-brand-primary" />
              <span className="text-[10px] font-bold text-brand-primary-dark uppercase tracking-wider">
                Internet Asset Intelligence
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Comprehensive host discovery and attack surface monitoring
            </p>
          </div>

          {/* IP & Hostname */}
          <div className="p-3 bg-surface-1 border border-border/30 text-center">
            <code className="text-base font-mono font-bold text-foreground">
              {resource.ip}
            </code>
            {dns?.names && dns.names.length > 0 && (
              <div className="text-[10px] text-brand-primary mt-1 font-mono break-all">
                {dns.names[0]}
              </div>
            )}
          </div>

          {/* Location Grid */}
          {location && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-brand-primary/5 border-l-4 border-brand-primary">
                <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Geolocation
                </span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-brand-primary/10 border border-brand-primary/20">
                <div className="px-3 py-2 bg-surface-1">
                  <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                    Country
                  </div>
                  <div className="text-sm font-medium text-foreground mt-0.5">
                    {location.country || "N/A"}
                  </div>
                </div>
                <div className="px-3 py-2 bg-surface-1">
                  <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                    City
                  </div>
                  <div className="text-sm font-medium text-foreground mt-0.5">
                    {location.city || "N/A"}
                  </div>
                </div>
                {location.postal_code && (
                  <div className="px-3 py-2 bg-surface-1">
                    <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                      Postal Code
                    </div>
                    <div className="text-sm font-medium text-foreground mt-0.5">
                      {location.postal_code}
                    </div>
                  </div>
                )}
                {location.coordinates && (
                  <div className="px-3 py-2 bg-surface-1">
                    <div className="text-[9px] font-medium text-brand-primary uppercase tracking-wide">
                      Coordinates
                    </div>
                    <div className="text-sm font-mono text-foreground mt-0.5">
                      {location.coordinates.latitude},{" "}
                      {location.coordinates.longitude}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ASN / Network Details */}
          {as && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-brand-primary/5 border-l-4 border-brand-primary">
                <Network className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Network Information
                </span>
              </div>
              <div className="space-y-px bg-border/20 border border-border/20">
                <div className="flex items-center py-2.5 px-3 hover:bg-brand-primary/5 transition-colors">
                  <div className="flex items-center gap-2 w-24 flex-shrink-0">
                    <Network className="h-3.5 w-3.5 text-brand-primary/60" />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      ASN
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-foreground">
                    AS{as.asn}
                  </span>
                </div>
                <div className="flex items-center py-2.5 px-3 hover:bg-brand-primary/5 transition-colors">
                  <div className="flex items-center gap-2 w-24 flex-shrink-0">
                    <Building2 className="h-3.5 w-3.5 text-brand-primary/60" />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Organization
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-foreground truncate">
                    {as.name || "N/A"}
                  </span>
                </div>
                {/* {as.route && (
                  <div className="flex items-center py-2.5 px-3 hover:bg-brand-primary/5 transition-colors">
                    <div className="flex items-center gap-2 w-24 flex-shrink-0">
                      <Globe className="h-3.5 w-3.5 text-brand-primary/60" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Route
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-foreground">
                      {as.route}
                    </span>
                  </div>
                )} */}
              </div>
            </div>
          )}

          {/* Open Services */}
          {data.services && data.services.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-brand-secondary/5 border-l-4 border-brand-secondary">
                <Server className="h-3.5 w-3.5 text-brand-secondary" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Open Services ({data.services.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1 p-2 bg-surface-1 border border-border/30 max-h-[100px] overflow-y-auto custom-scrollbar">
                {data.services.slice(0, 12).map((service, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] px-2 py-1 bg-brand-primary/10 text-brand-primary-dark border border-brand-primary/20 font-mono flex items-center gap-1"
                  >
                    <Wifi className="h-2.5 w-2.5" />
                    {service.port || service.service_name}
                  </span>
                ))}
                {data.services.length > 12 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{data.services.length - 12} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* WHOIS Summary */}
          {whois && (
            <div className="space-y-2">
              <button
                onClick={() => setWhoisExpanded(!whoisExpanded)}
                className="w-full flex items-center justify-between p-2 bg-brand-primary/5 border-l-4 border-brand-primary hover:bg-brand-primary/10 transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-brand-primary" />
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    WHOIS Information
                  </span>
                </div>
                {whoisExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-brand-primary/50" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-brand-primary/50" />
                )}
              </button>
              {whoisExpanded && (
                <div className="p-3 bg-surface-1 border border-border/30 max-h-[200px] overflow-y-auto custom-scrollbar">
                  <pre className="text-[9px] font-mono text-muted-foreground whitespace-pre-wrap break-all">
                    {typeof whois === "string"
                      ? whois
                      : JSON.stringify(whois, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t border-brand-primary/20">
            <button
              onClick={() =>
                window.open(
                  `https://search.censys.io/hosts/${resource.ip}`,
                  "_blank",
                )
              }
              className="flex-1 py-2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary-dark transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Full Report on Censys
            </button>
          </div>

          {/* Brand Footer */}
          <div className="text-center pt-2 border-t border-brand-primary/10">
            <span className="text-[8px] text-muted-foreground/60">
              Powered by{" "}
              <span className="text-brand-primary font-mono">Censys</span> •
              Attack surface management
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
