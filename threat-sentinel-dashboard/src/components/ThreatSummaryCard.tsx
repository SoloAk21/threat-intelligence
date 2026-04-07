// src/components/ThreatSummaryCard.tsx
import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Globe,
  Server,
  Clock,
  Wifi,
  Eye,
  Target,
  Download,
  ClipboardCopy,
  Check,
  FileText,
  ChevronDown,
  ChevronUp,
  Lock,
  Volume2,
  Activity,
} from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import type { ThreatData } from "@/types/threat";

interface ThreatSummaryCardProps {
  data: ThreatData;
  showActions?: boolean;
  onExport?: () => void;
  onCopy?: () => void;
}

interface ServiceStatus {
  available: boolean;
  hasData: boolean;
  error: boolean;
  errorMsg?: string;
}

export function ThreatSummaryCard({
  data,
  showActions = true,
  onExport,
  onCopy,
}: ThreatSummaryCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Privacy indicators - aggregate from all sources
  const isVPN =
    data.vpnapi?.security?.vpn ||
    data.ipteoh?.security?.vpn ||
    data.ipify?.proxy?.vpn ||
    false;
  const isProxy =
    data.vpnapi?.security?.proxy ||
    data.ipteoh?.security?.proxy ||
    data.ipify?.proxy?.proxy ||
    false;
  const isTor =
    data.vpnapi?.security?.tor ||
    data.ipteoh?.security?.tor ||
    data.ipify?.proxy?.tor ||
    false;
  const isNoise = data.greynoise?.noise || false;

  // Location data
  const countryCode =
    data.ipinfo?.country ||
    data.vpnapi?.location?.country_code ||
    data.vt?.country ||
    "N/A";
  const countryName =
    data.vpnapi?.location?.country || data.otx?.raw?.country_name || "Unknown";
  const city = data.ipinfo?.city || data.vpnapi?.location?.city || "N/A";
  const isp =
    data.ipinfo?.org?.split(" ").slice(1).join(" ") ||
    data.vpnapi?.network?.autonomous_system_organization ||
    data.ipify?.isp ||
    "N/A";

  // Risk calculation
  const riskScore = data.riskScore || 0;
  const riskLevel =
    riskScore >= 75
      ? "critical"
      : riskScore >= 50
        ? "high"
        : riskScore >= 25
          ? "medium"
          : "low";

  const getRiskColor = (score: number) => {
    if (score >= 75) return "text-red-500";
    if (score >= 50) return "text-orange-500";
    if (score >= 25) return "text-yellow-500";
    return "text-green-500";
  };

  // Service status
  const serviceStatus: Record<string, ServiceStatus> = {
    vt: {
      available: !!data.vt,
      hasData: !!data.vt?.last_analysis_stats,
      error: false,
    },
    abuseipdb: {
      available: !!data.abuseipdb,
      hasData: !!data.abuseipdb?.abuseConfidenceScore,
      error: false,
    },
    otx: {
      available: !!data.otx,
      hasData: !!data.otx?.pulse_count,
      error: false,
    },
    greynoise: {
      available: !!data.greynoise,
      hasData: !!data.greynoise?.raw,
      error: false,
    },
    pulsedive: {
      available: !!data.pulsedive,
      hasData: !!data.pulsedive?.raw,
      error: false,
    },
    vpnapi: { available: !!data.vpnapi, hasData: true, error: false },
    ipteoh: { available: !!data.ipteoh, hasData: true, error: false },
    ipqualityscore: {
      available: !!data.ipqualityscore,
      hasData: data.ipqualityscore?.raw?.success !== false,
      error: data.ipqualityscore?.raw?.success === false,
      errorMsg: data.ipqualityscore?.raw?.message,
    },
    threatfox: {
      available: !!data.threatfox,
      hasData: (data.threatfox?.ioc_count ?? 0) > 0,
      error: false,
    },
    censys: {
      available: !!data.censys,
      hasData: !!data.censys?.raw?.result?.resource,
      error: !data.censys?.raw?.result?.resource,
    },
    multirbl: {
      available: !!data.multirbl,
      hasData: !!data.multirbl?.lists?.length,
      error: false,
    },
    shodan: {
      available: !!data.shodan,
      hasData: !!data.shodan?.ports?.length,
      error: !!data.shodan?.note,
    },
    talos: {
      available: !!data.talos,
      hasData: false,
      error: !!data.talos?.note,
    },
    inquest: {
      available: !!data.inquest,
      hasData: !!data.inquest?.raw,
      error: !!data.inquest?.note,
    },
  };

  const availableServices = Object.values(serviceStatus).filter(
    (s) => s.available,
  ).length;
  const servicesWithData = Object.values(serviceStatus).filter(
    (s) => s.available && s.hasData,
  ).length;
  const servicesWithErrors = Object.values(serviceStatus).filter(
    (s) => s.error,
  ).length;

  const handleCopy = () => {
    const summary = `${data.input}: ${riskScore}/100 (${riskLevel}) | VT:${data.vt?.last_analysis_stats?.malicious || 0} | AbuseIPDB:${data.abuseipdb?.abuseConfidenceScore || 0}%`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `threat-${data.input}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.();
  };

  return (
    <div className="bg-card border-l-2 border-primary/60">
      {/* Compact Header */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Target className="h-3.5 w-3.5 text-primary/70 flex-shrink-0" />
          <span className="text-sm font-mono font-medium text-foreground truncate">
            {data.input}
          </span>
          <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30 rounded">
            {data.inputType?.toUpperCase() || "IP"}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            <span
              className={`text-lg font-bold tabular-nums ${getRiskColor(riskScore)}`}
            >
              {riskScore}
            </span>
            <span className="text-[9px] text-muted-foreground">/100</span>
          </div>

          <span
            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
              riskLevel === "critical"
                ? "bg-red-500/10 text-red-500 border-red-500/30"
                : riskLevel === "high"
                  ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
                  : riskLevel === "medium"
                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                    : "bg-green-500/10 text-green-500 border-green-500/30"
            }`}
          >
            {riskLevel}
          </span>

          {showActions && (
            <div className="flex items-center gap-0.5 ml-1">
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-muted/30 rounded"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <ClipboardCopy className="h-3 w-3 text-muted-foreground/60" />
                )}
              </button>
              <button
                onClick={handleExport}
                className="p-1 hover:bg-muted/30 rounded"
              >
                <Download className="h-3 w-3 text-muted-foreground/60" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="px-3 pb-2 flex items-center gap-3 text-[9px] border-b border-border/20">
        <div className="flex items-center gap-1">
          <Shield className="h-2.5 w-2.5 text-muted-foreground/40" />
          <span className="text-muted-foreground">VT</span>
          <span
            className={
              data.vt?.last_analysis_stats?.malicious
                ? "text-red-500 font-medium"
                : "text-green-500 font-medium"
            }
          >
            {data.vt?.last_analysis_stats?.malicious || 0}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-2.5 w-2.5 text-muted-foreground/40" />
          <span className="text-muted-foreground">AbuseIPDB</span>
          <span
            className={
              (data.abuseipdb?.abuseConfidenceScore || 0) >= 50
                ? "text-red-500 font-medium"
                : "text-green-500 font-medium"
            }
          >
            {data.abuseipdb?.abuseConfidenceScore || 0}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="h-2.5 w-2.5 text-muted-foreground/40" />
          <span className="text-muted-foreground">OTX</span>
          <span
            className={
              (data.otx?.pulse_count || 0) >= 10
                ? "text-red-500 font-medium"
                : "text-green-500 font-medium"
            }
          >
            {data.otx?.pulse_count || 0}
          </span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Clock className="h-2.5 w-2.5 text-muted-foreground/40" />
          <span className="text-muted-foreground/50">
            {new Date(data.timestamp).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Quick Info Row */}
      <div className="px-3 py-1.5 flex items-center gap-2 text-[9px] bg-muted/5 border-b border-border/20">
        {countryCode !== "N/A" && (
          <ReactCountryFlag
            countryCode={countryCode.toUpperCase()}
            svg
            style={{ width: "1em", height: "0.75em" }}
          />
        )}
        <span className="text-muted-foreground truncate">
          {city}, {countryName}
        </span>
        <span className="text-muted-foreground/30">•</span>
        <span className="text-muted-foreground truncate">{isp}</span>
        <span className="text-muted-foreground/30">•</span>
        <div className="flex items-center gap-1">
          <Wifi
            className={`h-2.5 w-2.5 ${isVPN ? "text-orange-500" : "text-muted-foreground/40"}`}
          />
          <span className={isVPN ? "text-orange-500" : "text-muted-foreground"}>
            {isVPN ? "VPN" : "No VPN"}
          </span>
        </div>
        <span className="text-muted-foreground/30">•</span>
        <div className="flex items-center gap-1">
          <Eye
            className={`h-2.5 w-2.5 ${isProxy ? "text-yellow-500" : "text-muted-foreground/40"}`}
          />
          <span
            className={isProxy ? "text-yellow-500" : "text-muted-foreground"}
          >
            {isProxy ? "Proxy" : "No Proxy"}
          </span>
        </div>
      </div>

      {/* Services Status Bar */}
      <div className="px-3 py-1 flex items-center gap-1 text-[8px] border-b border-border/20">
        <span className="text-muted-foreground/50">
          {servicesWithData}/{availableServices} services
        </span>
        <div className="flex-1 flex gap-0.5">
          {Object.entries(serviceStatus).map(([name, status]) => (
            <div
              key={name}
              className={`w-1.5 h-1.5 rounded-full ${
                !status.available
                  ? "bg-muted/30"
                  : status.error
                    ? "bg-red-500"
                    : status.hasData
                      ? "bg-green-500"
                      : "bg-yellow-500"
              }`}
              title={`${name}: ${status.error ? "Error" : status.hasData ? "Data" : "No data"}`}
            />
          ))}
        </div>
        {servicesWithErrors > 0 && (
          <span className="text-red-500">{servicesWithErrors} errors</span>
        )}
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full px-3 py-1 flex items-center justify-center gap-1 text-[9px] text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
      >
        {showDetails ? (
          <>
            <ChevronUp className="h-3 w-3" />
            <span>Hide Details</span>
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3" />
            <span>Show Details</span>
          </>
        )}
      </button>

      {/* Collapsible Details */}
      {showDetails && (
        <div className="px-3 pb-2 space-y-2 max-h-[300px] overflow-y-auto">
          {/* Privacy Section */}
          <div>
            <div className="text-[8px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
              Privacy & Security
            </div>
            <div className="grid grid-cols-4 gap-1">
              <div className="flex items-center justify-between px-2 py-1 bg-muted/5 rounded">
                <span className="text-[9px] text-muted-foreground">VPN</span>
                <span
                  className={`text-[9px] font-medium ${isVPN ? "text-orange-500" : "text-green-500"}`}
                >
                  {isVPN ? "YES" : "NO"}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-muted/5 rounded">
                <span className="text-[9px] text-muted-foreground">Proxy</span>
                <span
                  className={`text-[9px] font-medium ${isProxy ? "text-yellow-500" : "text-green-500"}`}
                >
                  {isProxy ? "YES" : "NO"}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-muted/5 rounded">
                <span className="text-[9px] text-muted-foreground">TOR</span>
                <span
                  className={`text-[9px] font-medium ${isTor ? "text-red-500" : "text-green-500"}`}
                >
                  {isTor ? "YES" : "NO"}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-muted/5 rounded">
                <span className="text-[9px] text-muted-foreground">
                  Scanner
                </span>
                <span
                  className={`text-[9px] font-medium ${isNoise ? "text-orange-500" : "text-green-500"}`}
                >
                  {isNoise ? "YES" : "NO"}
                </span>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <div className="text-[8px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
              Service Details
            </div>
            <div className="space-y-1">
              {data.vt && (
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-muted-foreground">VirusTotal</span>
                  <span>
                    <span className="text-red-500">
                      {data.vt.last_analysis_stats?.malicious || 0}
                    </span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="text-yellow-500">
                      {data.vt.last_analysis_stats?.suspicious || 0}
                    </span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="text-green-500">
                      {data.vt.last_analysis_stats?.harmless || 0}
                    </span>
                  </span>
                </div>
              )}
              {data.abuseipdb && (
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-muted-foreground">AbuseIPDB</span>
                  <span>
                    <span
                      className={
                        data.abuseipdb.abuseConfidenceScore >= 50
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    >
                      {data.abuseipdb.abuseConfidenceScore}%
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      • {data.abuseipdb.totalReports} reports
                    </span>
                  </span>
                </div>
              )}
              {data.otx && (
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-muted-foreground">AlienVault OTX</span>
                  <span>
                    <span
                      className={
                        data.otx.pulse_count >= 10
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    >
                      {data.otx.pulse_count} pulses
                    </span>
                  </span>
                </div>
              )}
              {data.greynoise && (
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-muted-foreground">GreyNoise</span>
                  <span
                    className={
                      data.greynoise.classification === "malicious"
                        ? "text-red-500"
                        : data.greynoise.noise
                          ? "text-orange-500"
                          : "text-green-500"
                    }
                  >
                    {data.greynoise.classification}{" "}
                    {data.greynoise.noise ? "(Scanner)" : ""}
                  </span>
                </div>
              )}
              {data.pulsedive && (
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-muted-foreground">Pulsedive</span>
                  <span
                    className={
                      (data.pulsedive.score || 0) >= 50
                        ? "text-red-500"
                        : "text-green-500"
                    }
                  >
                    Score: {data.pulsedive.score || 0} •{" "}
                    {data.pulsedive.risk || "none"}
                  </span>
                </div>
              )}
              {data.multirbl && (
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-muted-foreground">MultiRBL</span>
                  <span
                    className={
                      data.multirbl.listedCount > 0
                        ? "text-red-500"
                        : "text-green-500"
                    }
                  >
                    {data.multirbl.listedCount}/{data.multirbl.totalChecked}{" "}
                    listed
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Errors Section */}
          {servicesWithErrors > 0 && (
            <div>
              <div className="text-[8px] font-semibold text-red-500/70 uppercase tracking-wider mb-1">
                Errors ({servicesWithErrors})
              </div>
              <div className="space-y-0.5">
                {Object.entries(serviceStatus)
                  .filter(([_, s]) => s.error)
                  .map(([name, status]) => (
                    <div key={name} className="text-[8px] text-red-500/80">
                      <span className="font-medium">{name}:</span>{" "}
                      {status.errorMsg || "Service unavailable"}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
