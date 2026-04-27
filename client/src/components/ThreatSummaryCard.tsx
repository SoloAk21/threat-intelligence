// src/components/ThreatSummaryCard.tsx
import { useState, useRef, useEffect } from "react";
import {
  Shield,
  Target,
  Download,
  ClipboardCopy,
  Check,
  ChevronDown,
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
} from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import type { ThreatData, GreyNoiseData } from "@/types/threat";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ThreatSummaryCardProps {
  data: ThreatData;
  showActions?: boolean;
  onExport?: (format: "json" | "csv" | "pdf") => void;
  onCopy?: () => void;
  onSave?: () => void;
  savedAnalysisId?: string;
  isSaved?: boolean;
}

export function ThreatSummaryCard({
  data,
  showActions = true,
  onExport,
  onCopy,
  onSave,
  savedAnalysisId,
  isSaved: externalIsSaved,
}: ThreatSummaryCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(externalIsSaved || false);
  const [saveNotes, setSaveNotes] = useState("");
  const [saveTags, setSaveTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [existingSavedId, setExistingSavedId] = useState(
    savedAnalysisId || null,
  );
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const saveModalRef = useRef<HTMLDivElement>(null);

  const riskScore = data.riskScore || 0;
  const riskLevel = data.riskLevel;
  const riskCalculatedByAI =
    data.aiSummaryMeta?.riskCalculatedBy === "gemini-ai";
  const fallbackUsed = data.aiSummaryMeta?.fallbackUsed === true;

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!data.analysisId) return;
      try {
        const response = await api.get(`/saved/check/${data.analysisId}`);
        if (response.data.saved) {
          setIsSaved(true);
          setExistingSavedId(response.data.id);
        }
      } catch (err) {}
    };
    if (externalIsSaved === undefined) {
      checkSavedStatus();
    } else {
      setIsSaved(externalIsSaved);
      setExistingSavedId(savedAnalysisId || null);
    }
  }, [data.analysisId, externalIsSaved, savedAnalysisId]);

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

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 60) return "text-orange-500";
    if (score >= 40) return "text-amber-500";
    return "text-emerald-500";
  };

  const getRiskBg = (score: number) => {
    if (score >= 80) return "bg-red-500/5";
    if (score >= 60) return "bg-orange-500/5";
    if (score >= 40) return "bg-amber-500/5";
    return "bg-emerald-500/5";
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return { bg: "bg-red-500", text: "white" };
      case "HIGH":
        return { bg: "bg-orange-500", text: "white" };
      case "MEDIUM":
        return { bg: "bg-amber-500", text: "white" };
      default:
        return { bg: "bg-emerald-500", text: "white" };
    }
  };

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

  const handleCopy = () => {
    const summary = data.aiSummary?.executiveSummary || "No summary available";
    const text = `${data.input} | Risk: ${riskScore}/100 (${riskLevel}) | ${summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const handleExportClick = (format: "json" | "csv" | "pdf") => {
    setShowExportMenu(false);
    onExport?.(format);
  };

  const handleSaveClick = () => {
    setSaveNotes("");
    setSaveTags("");
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    if (!data.analysisId) {
      toast.error("Cannot save: No analysis ID");
      return;
    }

    setSaving(true);
    try {
      if (onSave) {
        await onSave();
      } else {
        const response = await api.post("/save", {
          analysisId: data.analysisId,
          notes: saveNotes,
          tags: saveTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        });
        if (response.data.success) {
          setIsSaved(response.data.data.saved);
          setExistingSavedId(response.data.data._id);
          toast.success(response.data.message);
        }
      }
      setShowSaveModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!existingSavedId) return;

    setDeleting(true);
    try {
      const response = await api.post("/save", {
        analysisId: data.analysisId,
        notes: "",
        tags: [],
      });
      if (response.data.success && !response.data.data.saved) {
        setIsSaved(false);
        setExistingSavedId(null);
        setShowDeleteConfirm(false);
        toast.success("Removed from saved");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to remove");
    } finally {
      setDeleting(false);
    }
  };

  const riskBadge = getRiskBadge(riskLevel || "LOW");

  return (
    <>
      <div className="bg-card border border-border/30 shadow-sm">
        <div
          className={`relative overflow-hidden ${getRiskBg(riskScore)} border-b border-border/30`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />

          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 ${getRiskBg(riskScore)} border ${getRiskColor(riskScore)}/20`}
                >
                  <Target className={`h-5 w-5 ${getRiskColor(riskScore)}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-lg font-semibold tracking-tight">
                      {data.input}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 font-mono">
                      {data.type?.toUpperCase() ||
                        data.inputType?.toUpperCase() ||
                        "IP"}
                    </span>
                    {riskCalculatedByAI && (
                      <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary font-mono flex items-center gap-1">
                        <Zap className="h-2.5 w-2.5" /> AI Scored
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      {countryCode !== "XX" ? (
                        <>
                          <ReactCountryFlag
                            countryCode={countryCode}
                            svg
                            style={{ width: "12px", height: "8px" }}
                          />
                          <span>
                            {city && `${city}, `}
                            {countryName}
                          </span>
                        </>
                      ) : (
                        <span>Location unknown</span>
                      )}
                    </div>
                    {isp && (
                      <div className="flex items-center gap-1.5">
                        <Server className="h-3 w-3" />
                        <span className="truncate max-w-[240px]">{isp}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="relative">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-muted/20"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${riskScore * 2.136} 213.6`}
                        className={getRiskColor(riskScore)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className={`text-2xl font-bold ${getRiskColor(riskScore)}`}
                      >
                        {riskScore}
                      </span>
                      <span className="text-[8px] text-muted-foreground -mt-1">
                        /100
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`px-3 py-1.5 ${riskBadge.bg} text-${riskBadge.text} text-xs font-bold uppercase tracking-wider`}
                >
                  {riskLevel || "LOW"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showActions && data.analysisId && (
          <div className="px-6 py-3 border-b border-border/30 bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {(isVPN || isProxy || isTor || isNoise || isRiot) && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="flex gap-1.5">
                      {isVPN && (
                        <span className="px-2 py-0.5 text-[9px] font-mono bg-orange-500/10 text-orange-500 border border-orange-500/20">
                          VPN
                        </span>
                      )}
                      {isProxy && (
                        <span className="px-2 py-0.5 text-[9px] font-mono bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          Proxy
                        </span>
                      )}
                      {isTor && (
                        <span className="px-2 py-0.5 text-[9px] font-mono bg-red-500/10 text-red-500 border border-red-500/20">
                          Tor
                        </span>
                      )}
                      {isNoise && (
                        <span className="px-2 py-0.5 text-[9px] font-mono bg-purple-500/10 text-purple-500 border border-purple-500/20">
                          Scanner
                        </span>
                      )}
                      {isRiot && (
                        <span className="px-2 py-0.5 text-[9px] font-mono bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          RIOT
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                {isSaved ? (
                  <>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-mono border border-emerald-500/20">
                      <Check className="h-3 w-3" />
                      Saved
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete from saved"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSaveClick}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Save analysis"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={handleCopy}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Copy summary"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ClipboardCopy className="h-4 w-4" />
                  )}
                </button>

                <div className="relative" ref={exportMenuRef}>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Export"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {showExportMenu && (
                    <div className="absolute top-full right-0 mt-1 w-36 bg-card border border-border/40 shadow-lg z-10">
                      <button
                        onClick={() => handleExportClick("json")}
                        className="w-full px-3 py-2 text-xs text-left text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2 border-b border-border/30"
                      >
                        <FileJson className="h-3.5 w-3.5" /> JSON
                      </button>
                      <button
                        onClick={() => handleExportClick("csv")}
                        className="w-full px-3 py-2 text-xs text-left text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2 border-b border-border/30"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                      </button>
                      <button
                        onClick={() => handleExportClick("pdf")}
                        className="w-full px-3 py-2 text-xs text-left text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
                      >
                        <FileText className="h-3.5 w-3.5" /> PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {data.aiSummary && (
          <div className="px-6 py-5 border-b border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Intelligence Summary
              </span>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <Zap className="h-2.5 w-2.5" />
                  <span>Powered by Gemini</span>
                </div>
                <span className="text-[9px] text-muted-foreground font-mono px-1.5 py-0.5 bg-muted/30">
                  {data.aiSummaryMeta?.model?.split("-")[1] || "AI"}
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-foreground/85 mb-5">
              {data.aiSummary.executiveSummary}
            </p>

            <div className="grid grid-cols-4 gap-3 mb-5">
              <div className="p-2 border-l-2 border-primary/30 bg-muted/5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
                  AbuseIPDB
                </div>
                <div
                  className={`text-lg font-bold ${abuseConfidence >= 80 ? "text-red-500" : abuseConfidence >= 50 ? "text-orange-500" : "text-emerald-500"}`}
                >
                  {abuseConfidence}%
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {totalReports} reports
                </div>
              </div>
              <div className="p-2 border-l-2 border-primary/30 bg-muted/5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
                  VirusTotal
                </div>
                <div className="text-lg font-bold text-red-500">
                  {vtMalicious}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  malicious
                </div>
              </div>
              <div className="p-2 border-l-2 border-primary/30 bg-muted/5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
                  OTX Pulses
                </div>
                <div className="text-lg font-bold">{otxPulses}</div>
                <div className="text-[9px] text-muted-foreground">
                  threat intel
                </div>
              </div>
              <div className="p-2 border-l-2 border-primary/30 bg-muted/5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
                  GreyNoise
                </div>
                <div
                  className={`text-lg font-bold ${greyNoiseClassification === "malicious" ? "text-red-500" : greyNoiseClassification === "benign" ? "text-emerald-500" : "text-muted-foreground"}`}
                >
                  {greyNoiseClassification}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {isNoise ? "active scanner" : "inactive"}
                </div>
              </div>
            </div>

            {data.aiSummary.riskAssessment && (
              <div className="mb-4">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Risk Assessment
                </div>
                <div className="text-sm text-foreground/70 leading-relaxed">
                  {data.aiSummary.riskAssessment.length > 200
                    ? `${data.aiSummary.riskAssessment.substring(0, 200)}...`
                    : data.aiSummary.riskAssessment}
                </div>
              </div>
            )}

            {data.aiSummary.keyIndicators?.length > 0 && (
              <div className="mb-4">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Key Indicators
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.aiSummary.keyIndicators.slice(0, 5).map((ind, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-1 bg-muted/20 border border-border/30 font-mono"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.aiSummary.recommendations?.length > 0 && (
              <div className="mb-4">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Recommendations
                </div>
                <ul className="space-y-1.5">
                  {data.aiSummary.recommendations.slice(0, 3).map((rec, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">→</span>
                      <span className="text-foreground/70">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.aiSummary.tacticalAdvice && (
              <div className="mt-4 pt-3 border-t border-border/30">
                <p className="text-xs font-semibold text-primary flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Immediate Action:{" "}
                  {data.aiSummary.tacticalAdvice}
                </p>
              </div>
            )}

            {fallbackUsed && (
              <div className="mt-4 p-2 bg-amber-500/5 border-l-2 border-amber-500">
                <p className="text-[10px] text-amber-600">
                  ⚠ AI service temporarily unavailable - using fallback scoring
                </p>
              </div>
            )}
          </div>
        )}

        {ipqsError && (
          <div className="px-6 py-2 border-b border-amber-500/20 bg-amber-500/5">
            <p className="text-[10px] text-amber-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {ipqsMessage}
            </p>
          </div>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-6 py-3 text-[11px] flex items-center justify-between hover:bg-muted/10 transition-colors text-muted-foreground border-b border-border/30"
        >
          <span className="uppercase tracking-wider flex items-center gap-2">
            <Globe className="h-3 w-3" /> Technical Details
          </span>
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-200 ${showDetails ? "rotate-90" : ""}`}
          />
        </button>

        {showDetails && (
          <div className="px-6 py-4 text-sm space-y-4 bg-muted/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">AbuseIPDB</span>
                <span
                  className={`font-mono font-medium ${abuseConfidence >= 80 ? "text-red-500" : ""}`}
                >
                  {abuseConfidence}%
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Reports</span>
                <span className="font-mono">{totalReports}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">VT Malicious</span>
                <span className="font-mono text-red-500">{vtMalicious}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">VT Suspicious</span>
                <span className="font-mono text-amber-500">{vtSuspicious}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">OTX Pulses</span>
                <span className="font-mono">{otxPulses}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">GreyNoise</span>
                <span
                  className={`font-mono ${greyNoiseClassification === "malicious" ? "text-red-500" : ""}`}
                >
                  {greyNoiseClassification}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">RBL Listed</span>
                <span
                  className={`font-mono ${(data.multirbl?.listedCount || 0) > 0 ? "text-red-500" : "text-emerald-500"}`}
                >
                  {data.multirbl?.listedCount || 0}/
                  {data.multirbl?.totalChecked || 0}
                </span>
              </div>
            </div>

            {data.aiSummaryMeta?.model && (
              <div className="pt-2 border-t border-border/30">
                <div className="text-[10px] text-muted-foreground mb-1">
                  Analysis Model
                </div>
                <div className="text-xs font-mono text-foreground/70">
                  {data.aiSummaryMeta.model}
                </div>
              </div>
            )}

            {data.aiSummary?.sourcesContributingMost?.length > 0 && (
              <div className="pt-2 border-t border-border/30">
                <div className="text-[10px] text-muted-foreground mb-1">
                  Intelligence Sources
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.aiSummary.sourcesContributingMost.map((source, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 border border-border/30 font-mono"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            ref={saveModalRef}
            className="bg-card border border-border/40 w-[440px] max-w-[90vw] shadow-xl"
          >
            <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10">
                  <Bookmark className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wide">
                  {isSaved ? "Update Saved Analysis" : "Save Analysis"}
                </h3>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 hover:bg-muted/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Notes
                </label>
                <textarea
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-transparent border border-border/40 focus:outline-none focus:border-primary/50 transition-colors"
                  rows={3}
                  placeholder="Add your observations, context, or investigation notes..."
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Tags
                </label>
                <input
                  type="text"
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder="malware, c2, phishing, apt"
                  className="w-full px-3 py-2 text-sm bg-transparent border border-border/40 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <p className="text-[9px] text-muted-foreground mt-1">
                  Separate tags with commas for easy filtering
                </p>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border/30 flex gap-3">
              <button
                onClick={handleSaveConfirm}
                disabled={saving}
                className="flex-1 py-2 bg-primary text-white text-[11px] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {saving ? "Saving..." : isSaved ? "Update" : "Save"}
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2 bg-muted/20 text-muted-foreground text-[11px] font-medium hover:bg-muted/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border/40 w-[400px] max-w-[90vw] shadow-xl">
            <div className="px-5 py-4 border-b border-border/30 flex items-center gap-2">
              <div className="p-1.5 bg-red-500/10">
                <Trash2 className="h-4 w-4 text-red-500" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wide">
                Delete Saved Analysis
              </h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-foreground/80">
                Remove this analysis from your saved collection?
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                This action cannot be undone.
              </p>
            </div>
            <div className="px-5 py-4 border-t border-border/30 flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2 bg-red-500 text-white text-[11px] font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 bg-muted/20 text-muted-foreground text-[11px] font-medium hover:bg-muted/30 transition-colors"
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
