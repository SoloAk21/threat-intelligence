import { useState, useRef, useEffect } from "react";
import {
  Shield,
  Target,
  Download,
  ClipboardCopy,
  Check,
  AlertTriangle,
  Eye,
  FileText,
  FileJson,
  FileSpreadsheet,
  Bookmark,
  ChevronRight,
  Trash2,
  X,
  Loader2,
  Save,
  Activity,
  MapPin,
  Server,
  Globe,
  Zap,
  TrendingDown,
  Brain,
  Network,
  Clock,
} from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import type { ThreatData, GreyNoiseData } from "@/types/threat";

import { toast } from "sonner";
import { downloadPDF, threatToCSV, threatToJSON } from "@/utils/exportUtils";
import api from "@/lib/api";

interface ThreatSummaryCardProps {
  data: ThreatData;
  showActions?: boolean;
  onExport?: (format: "json" | "csv" | "pdf") => void;
  onCopy?: () => void;
  onSave?: (notes?: string, tags?: string[]) => Promise<boolean>;
  savedAnalysisId?: string;
  isSaved?: boolean;
}

const RISK_CONFIG = {
  thresholds: { critical: 80, high: 60, medium: 40 },
  levels: {
    CRITICAL: {
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/10",
      badge: "bg-red-600",
    },
    HIGH: {
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/10",
      badge: "bg-orange-600",
    },
    MEDIUM: {
      color: "text-yellow-600",
      bg: "bg-yellow-50 dark:bg-yellow-950/10",
      badge: "bg-yellow-600",
    },
    LOW: {
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/10",
      badge: "bg-green-600",
    },
  },
} as const;

const RiskMeter = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 34;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={`transition-all duration-500 ${
            score >= 80
              ? "text-red-600"
              : score >= 60
                ? "text-orange-600"
                : score >= 40
                  ? "text-yellow-600"
                  : "text-green-600"
          }`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-lg font-bold ${
            score >= 80
              ? "text-red-600"
              : score >= 60
                ? "text-orange-600"
                : score >= 40
                  ? "text-yellow-600"
                  : "text-green-600"
          }`}
        >
          {score}
        </span>
        <span className="text-[7px] text-gray-500 -mt-0.5">/100</span>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, subtext, color = "default" }: any) => (
  <div className="p-2 border-l-2 border-teal-500/30 bg-gray-50/50 dark:bg-gray-900/30 rounded-r">
    <div className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </div>
    <div
      className={`text-base font-bold mt-0.5 ${
        color === "critical"
          ? "text-red-600"
          : color === "high"
            ? "text-orange-600"
            : "text-gray-900 dark:text-gray-100"
      }`}
    >
      {value}
    </div>
    {subtext && (
      <div className="text-[8px] text-gray-500 mt-0.5">{subtext}</div>
    )}
  </div>
);

const Badge = ({ children, variant = "default" }: any) => {
  const variants = {
    default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    vpn: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
    proxy:
      "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300",
    tor: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
    scanner: "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300",
    riot: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  };

  return (
    <span
      className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${variants[variant] || variants.default}`}
    >
      {children}
    </span>
  );
};

const ActionButton = ({
  onClick,
  icon: Icon,
  title,
  disabled = false,
}: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    title={title}
  >
    <Icon className="h-3.5 w-3.5" />
  </button>
);

export function ThreatSummaryCard({
  data,
  showActions = true,
  onExport,
  onCopy,
  onSave,
  savedAnalysisId,
  isSaved: externalIsSaved,
}: ThreatSummaryCardProps) {
  // FIX: Get analysis ID from either analysisId or _id field with type assertion
  const analysisId = data.analysisId || (data as any)._id;

  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // FIX: Check data.saved property as well
  const [isSaved, setIsSaved] = useState(
    externalIsSaved || (data as any).saved || false,
  );
  const [saveNotes, setSaveNotes] = useState("");
  const [saveTags, setSaveTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [existingSavedId, setExistingSavedId] = useState(
    savedAnalysisId || ((data as any).saved ? analysisId : null),
  );

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const saveModalRef = useRef<HTMLDivElement>(null);

  const riskScore = data.riskScore || 0;
  const riskLevel = data.riskLevel || "LOW";
  const riskCalculatedByAI =
    data.aiSummaryMeta?.riskCalculatedBy === "gemini-ai";
  const fallbackUsed = data.aiSummaryMeta?.fallbackUsed === true;

  const abuseConfidence = data.abuseipdb?.abuseConfidenceScore || 0;
  const totalReports = data.abuseipdb?.totalReports || 0;
  const vtMalicious = data.vt?.last_analysis_stats?.malicious || 0;
  const vtSuspicious = data.vt?.last_analysis_stats?.suspicious || 0;
  const otxPulses = data.otx?.pulse_count || 0;

  const greynoise = data.greynoise as GreyNoiseData;
  const isNoise = greynoise?.noise || false;
  const greyNoiseClassification = greynoise?.classification || "unknown";
  const isRiot = greynoise?.riot || false;

  const isVPN = data.vpnapi?.security?.vpn || false;
  const isProxy = data.vpnapi?.security?.proxy || false;
  const isTor = data.vpnapi?.security?.tor || false;

  const countryCode =
    data.ipinfo?.country || data.abuseipdb?.countryCode || "XX";
  const countryName =
    data.ipinfo?.country || data.abuseipdb?.countryName || "Unknown";
  const city = data.ipinfo?.city || "";
  const isp = data.ipinfo?.org_name || data.abuseipdb?.isp || "";

  const ipqsError = data.ipqualityscore?.raw?.success === false;
  const ipqsMessage = data.ipqualityscore?.raw?.message || "";

  // Check if this is a temporary analysis (not saved)
  const isTemporary = analysisId && !isSaved && !existingSavedId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
      if (
        saveModalRef.current &&
        !saveModalRef.current.contains(event.target as Node)
      ) {
        setShowSaveModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // FIX: Check saved status using analysisId
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!analysisId) return;

      // If already marked as saved from props/data, no need to check
      if (externalIsSaved || data.saved) {
        setIsSaved(true);
        setExistingSavedId(analysisId);
        return;
      }

      try {
        const response = await api.get(`/saved/check/${analysisId}`);
        if (response.data.saved) {
          setIsSaved(true);
          setExistingSavedId(response.data.id);
        }
      } catch (err) {
        // Ignore errors for temporary analyses
      }
    };

    checkSavedStatus();
  }, [analysisId, externalIsSaved, data.saved]);

  const handleCopy = () => {
    const summary = data.aiSummary?.executiveSummary || "No summary available";
    const text = `${data.input} | Risk: ${riskScore}/100 (${riskLevel}) | ${summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const handleExportClick = async (format: "json" | "csv" | "pdf") => {
    setShowExportMenu(false);

    try {
      if (format === "json") {
        const jsonData = threatToJSON(data);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `threat-report-${data.input}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("JSON report downloaded");
      } else if (format === "csv") {
        const csvData = threatToCSV(data);
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `threat-report-${data.input}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("CSV report downloaded");
      } else if (format === "pdf") {
        const bgImagePath = "/images/pdf-bg.png";
        await downloadPDF(data, `threat-report-${data.input}.pdf`, bgImagePath);
        toast.success("PDF report generated");
      }
      onExport?.(format);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(`Failed to generate ${format.toUpperCase()} report`);
    }
  };

  // FIX: Use analysisId instead of data.analysisId
  const handleSaveConfirm = async () => {
    if (!analysisId) {
      toast.error("Cannot save: No analysis ID found");
      return;
    }

    setSaving(true);
    try {
      if (onSave) {
        const success = await onSave(
          saveNotes,
          saveTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        );
        if (success) {
          setIsSaved(true);
          setShowSaveModal(false);
          toast.success("Analysis saved to your collection");
        }
      } else {
        // Direct API call with tempId
        const response = await api.post("/save", {
          tempId: analysisId,
          notes: saveNotes,
          tags: saveTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        });

        if (response.data.success) {
          setIsSaved(true);
          setExistingSavedId(response.data.data._id);
          toast.success(response.data.message || "Analysis saved successfully");
          setShowSaveModal(false);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error("This analysis is already saved");
      } else if (err.response?.status === 404) {
        toast.error("Analysis expired. Please re-run the analysis.");
      } else {
        toast.error(err.response?.data?.error || "Failed to save analysis");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!existingSavedId) return;

    setDeleting(true);
    try {
      await api.delete(`/saved/${existingSavedId}`);
      setIsSaved(false);
      setExistingSavedId(null);
      setShowDeleteConfirm(false);
      toast.success("Removed from saved analyses");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to remove");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header Section - Single Row Layout */}
        <div
          className={`relative ${RISK_CONFIG.levels[riskLevel as keyof typeof RISK_CONFIG.levels]?.bg || RISK_CONFIG.levels.LOW.bg} p-4`}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-teal-500/5 to-transparent pointer-events-none" />

          <div className="relative flex items-center justify-between gap-4 flex-wrap lg:flex-nowrap">
            {/* Left: IP Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`p-2 rounded-lg ${RISK_CONFIG.levels[riskLevel as keyof typeof RISK_CONFIG.levels]?.bg || RISK_CONFIG.levels.LOW.bg} shrink-0`}
              >
                <Target
                  className={`h-4 w-4 ${RISK_CONFIG.levels[riskLevel as keyof typeof RISK_CONFIG.levels]?.color || RISK_CONFIG.levels.LOW.color}`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-base font-semibold text-gray-900 dark:text-white truncate">
                    {data.input}
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    {data.type?.toUpperCase() ||
                      data.inputType?.toUpperCase() ||
                      "IP"}
                  </span>
                  {riskCalculatedByAI && (
                    <span className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded font-mono">
                      <Zap className="h-2 w-2" /> AI Scored
                    </span>
                  )}
                  {isTemporary && (
                    <span className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded font-mono">
                      <Clock className="h-2 w-2" />
                      Temporary
                    </span>
                  )}
                  {!isTemporary && isSaved && (
                    <span className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded font-mono">
                      <Check className="h-2 w-2" />
                      Saved
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {countryCode !== "XX" ? (
                      <>
                        <ReactCountryFlag
                          countryCode={countryCode}
                          svg
                          style={{ width: "10px", height: "7px" }}
                        />
                        <span className="text-[11px]">
                          {city && `${city}, `}
                          {countryName}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px]">Location unknown</span>
                    )}
                  </div>
                  {isp && (
                    <div className="flex items-center gap-1 min-w-0">
                      <Server className="h-3 w-3 shrink-0" />
                      <span className="text-[11px] truncate">
                        {isp.split(" ").slice(0, 3).join(" ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Security Badges */}
            {(isVPN || isProxy || isTor || isNoise || isRiot) && (
              <div className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-gray-400" />
                <div className="flex gap-1 flex-wrap">
                  {isVPN && <Badge variant="vpn">VPN</Badge>}
                  {isProxy && <Badge variant="proxy">Proxy</Badge>}
                  {isTor && <Badge variant="tor">Tor</Badge>}
                  {isNoise && <Badge variant="scanner">Scanner</Badge>}
                  {isRiot && <Badge variant="riot">RIOT</Badge>}
                </div>
              </div>
            )}

            {/* Right: Risk Score & Actions */}
            <div className="flex items-center gap-4 shrink-0">
              <RiskMeter score={riskScore} />
              <div
                className={`px-2.5 py-1 rounded-lg ${RISK_CONFIG.levels[riskLevel as keyof typeof RISK_CONFIG.levels]?.badge} text-white text-[10px] font-bold uppercase tracking-wider`}
              >
                {riskLevel}
              </div>

              {/* FIX: Use analysisId instead of data.analysisId */}
              {showActions && analysisId && (
                <div className="flex items-center gap-0.5 border-l border-gray-200 dark:border-gray-700 pl-3 ml-1">
                  {isSaved ? (
                    <>
                      <ActionButton
                        onClick={() => setShowDeleteConfirm(true)}
                        icon={Trash2}
                        title="Remove from saved"
                      />
                    </>
                  ) : (
                    <ActionButton
                      onClick={() => setShowSaveModal(true)}
                      icon={Bookmark}
                      title="Save analysis permanently"
                    />
                  )}

                  <ActionButton
                    onClick={handleCopy}
                    icon={copied ? Check : ClipboardCopy}
                    title="Copy summary"
                  />

                  <div className="relative" ref={exportMenuRef}>
                    <ActionButton
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      icon={Download}
                      title="Export"
                    />
                    {showExportMenu && (
                      <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
                        {[
                          { format: "json", icon: FileJson, label: "JSON" },
                          {
                            format: "csv",
                            icon: FileSpreadsheet,
                            label: "CSV",
                          },
                          { format: "pdf", icon: FileText, label: "PDF" },
                        ].map(({ format, icon: Icon, label }) => (
                          <button
                            key={format}
                            onClick={() => handleExportClick(format as any)}
                            className="w-full px-3 py-1.5 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                          >
                            <Icon className="h-3 w-3" /> {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Summary Section */}
        {data.aiSummary && (
          <div className="p-5 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-teal-100 dark:bg-teal-950">
                  <Brain className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Intelligence Summary
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 text-[8px] text-gray-500">
                  <Zap className="h-2 w-2" />
                  <span>Gemini AI</span>
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              {data.aiSummary.executiveSummary}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <MetricCard
                label="AbuseIPDB"
                value={`${abuseConfidence}%`}
                subtext={`${totalReports} reports`}
                color={
                  abuseConfidence >= 80
                    ? "critical"
                    : abuseConfidence >= 50
                      ? "high"
                      : "default"
                }
              />
              <MetricCard
                label="VirusTotal"
                value={vtMalicious}
                subtext="malicious"
                color={vtMalicious > 0 ? "critical" : "default"}
              />
              <MetricCard
                label="OTX Pulses"
                value={otxPulses}
                subtext="threat intel"
              />
              <MetricCard
                label="GreyNoise"
                value={greyNoiseClassification}
                subtext={isNoise ? "active scanner" : "inactive"}
                color={
                  greyNoiseClassification === "malicious"
                    ? "critical"
                    : "default"
                }
              />
            </div>

            {data.aiSummary.riskAssessment && (
              <div className="mb-3 p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingDown className="h-3 w-3 text-gray-500" />
                  <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">
                    Risk Assessment
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {data.aiSummary.riskAssessment.length > 200
                    ? `${data.aiSummary.riskAssessment.substring(0, 200)}...`
                    : data.aiSummary.riskAssessment}
                </p>
              </div>
            )}

            {data.aiSummary.keyIndicators?.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Eye className="h-3 w-3 text-gray-500" />
                  <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">
                    Key Indicators
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.aiSummary.keyIndicators.slice(0, 5).map((ind, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded font-mono"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.aiSummary.recommendations?.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">
                    Recommendations
                  </span>
                </div>
                <ul className="space-y-1">
                  {data.aiSummary.recommendations.slice(0, 3).map((rec, i) => (
                    <li key={i} className="flex gap-1.5 text-xs">
                      <span className="text-teal-500 font-bold">→</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {rec}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.aiSummary.tacticalAdvice && (
              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-800">
                <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5" /> Immediate Action:{" "}
                  {data.aiSummary.tacticalAdvice}
                </p>
              </div>
            )}

            {fallbackUsed && (
              <div className="mt-3 p-1.5 bg-amber-50 dark:bg-amber-950/20 border-l-2 border-amber-500 rounded">
                <p className="text-[9px] text-amber-700 dark:text-amber-400">
                  ⚠ AI service temporarily unavailable - using fallback scoring
                </p>
              </div>
            )}
          </div>
        )}

        {ipqsError && (
          <div className="px-5 py-1.5 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-800">
            <p className="text-[9px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="h-2.5 w-2.5" /> {ipqsMessage}
            </p>
          </div>
        )}

        {/* Technical Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-5 py-2.5 text-[10px] flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-500 border-t border-gray-200 dark:border-gray-800"
        >
          <span className="uppercase tracking-wider flex items-center gap-1.5">
            <Network className="h-3 w-3" /> Technical Details
          </span>
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform duration-200 ${showDetails ? "rotate-90" : ""}`}
          />
        </button>

        {showDetails && (
          <div className="px-5 py-3 text-xs space-y-3 bg-gray-50 dark:bg-gray-900/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <div className="text-[9px] text-gray-500">AbuseIPDB</div>
                <div
                  className={`font-mono text-xs ${abuseConfidence >= 80 ? "text-red-600" : ""}`}
                >
                  {abuseConfidence}% ({totalReports} reports)
                </div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500">VirusTotal</div>
                <div className="font-mono text-xs">
                  <span className="text-red-600">{vtMalicious} malicious</span>
                  {vtSuspicious > 0 && (
                    <span className="text-amber-600 ml-1">
                      , {vtSuspicious} suspicious
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500">OTX</div>
                <div className="font-mono text-xs">{otxPulses} pulses</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500">GreyNoise</div>
                <div
                  className={`font-mono text-xs ${greyNoiseClassification === "malicious" ? "text-red-600" : ""}`}
                >
                  {greyNoiseClassification} {isNoise && "(active)"}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500">RBL Status</div>
                <div
                  className={`font-mono text-xs ${(data.multirbl?.listedCount || 0) > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {data.multirbl?.listedCount || 0}/
                  {data.multirbl?.totalChecked || 0} blocks
                </div>
              </div>
            </div>

            {data.aiSummaryMeta?.model && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                <div className="text-[9px] text-gray-500 mb-0.5">
                  Analysis Model
                </div>
                <div className="text-[10px] font-mono text-gray-600 dark:text-gray-400">
                  {data.aiSummaryMeta.model}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            ref={saveModalRef}
            className="bg-white dark:bg-gray-900 rounded-xl w-[400px] max-w-[90vw] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950">
                  <Bookmark className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-sm font-semibold">
                  Save Analysis Permanently
                </h3>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded -mt-1">
                <Clock className="h-3 w-3 inline mr-1" />
                This analysis will expire in 1 hour if not saved.
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add investigation notes, findings, or context..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder="malware, c2, phishing, apt, ransomware"
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p className="text-[9px] text-gray-500 mt-1">
                  Separate multiple tags with commas
                </p>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <button
                onClick={handleSaveConfirm}
                disabled={saving}
                className="flex-1 py-1.5 bg-teal-600 text-white text-xs font-medium rounded hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                {saving ? "Saving..." : "Save Permanently"}
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl w-[360px] max-w-[90vw] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-red-100 dark:bg-red-950">
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
              </div>
              <h3 className="text-sm font-semibold">Remove Saved Analysis</h3>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Remove this analysis from your saved collection?
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This action cannot be undone.
              </p>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                {deleting ? "Removing..." : "Remove"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
