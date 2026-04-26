// src/components/SavedAnalyses.tsx
import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Star,
  Trash2,
  FileText,
  ExternalLink,
  Loader2,
  X,
  MapPin,
  Server,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import ReactCountryFlag from "react-country-flag";

interface SavedAnalysis {
  _id: string;
  input: string;
  inputType: string;
  riskScore: number;
  riskLevel: string;
  aiSummary?: {
    executiveSummary: string;
    riskAssessment?: string;
    keyIndicators: string[];
    recommendations: string[];
    sourcesContributingMost?: string[];
    tacticalAdvice?: string;
    confidenceLevel?: string;
  };
  notes: string;
  tags: string[];
  starred: boolean;
  savedAt: string;
  createdAt: string;
  serviceResponses?: {
    ipinfo?: { country?: string; city?: string; org_name?: string };
    abuseipdb?: {
      abuseConfidenceScore?: number;
      isp?: string;
      countryCode?: string;
    };
    vt?: { last_analysis_stats?: { malicious?: number } };
    greynoise?: { classification?: string };
  };
}

export function SavedAnalyses() {
  const queryClient = useQueryClient();
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<SavedAnalysis | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editTags, setEditTags] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["saved-analyses"],
    queryFn: async () => {
      const res = await api.get("/saved");
      return res.data.data;
    },
  });

  const toggleStarMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/saved/${id}/star`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-analyses"] });
      toast.success("Updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/saved/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-analyses"] });
      toast.success("Removed from saved");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      notes,
      tags,
    }: {
      id: string;
      notes: string;
      tags: string[];
    }) => {
      const res = await api.patch(`/saved/${id}`, { notes, tags });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-analyses"] });
      toast.success("Updated");
      setSelectedAnalysis(null);
    },
  });

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 60) return "text-orange-500";
    if (score >= 40) return "text-amber-500";
    return "text-emerald-500";
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "HIGH":
        return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    }
  };

  const getLocationInfo = (item: SavedAnalysis) => {
    const country =
      item.serviceResponses?.ipinfo?.country ||
      item.serviceResponses?.abuseipdb?.countryCode ||
      "XX";
    const city = item.serviceResponses?.ipinfo?.city || "";
    const isp =
      item.serviceResponses?.ipinfo?.org_name ||
      item.serviceResponses?.abuseipdb?.isp ||
      "";
    return { country, city, isp };
  };

  const saved = data?.saved || [];

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-3 py-20 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto text-red-500 mb-3" />
        <p className="text-sm text-muted-foreground">
          Failed to load saved analyses
        </p>
        <button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["saved-analyses"] })
          }
          className="mt-3 px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 px-3 py-3">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 border border-primary/30">
          <Bookmark className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Saved Analyses
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {saved.length} indicator{saved.length !== 1 ? "s" : ""} in your
            collection
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : saved.length === 0 ? (
        <div className="bg-card border border-border/20 py-20 text-center">
          <Bookmark className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-xs text-muted-foreground">No saved analyses yet</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">
            Click the "Save" button on any analysis to add it here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map((item: SavedAnalysis) => {
            const { country, city, isp } = getLocationInfo(item);
            const abuseConfidence =
              item.serviceResponses?.abuseipdb?.abuseConfidenceScore || 0;
            const vtMalicious =
              item.serviceResponses?.vt?.last_analysis_stats?.malicious || 0;
            const greyNoiseClassification =
              item.serviceResponses?.greynoise?.classification || "unknown";

            return (
              <div
                key={item._id}
                className="bg-card border border-border/30 hover:border-border/60 transition-all"
              >
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-border/20 bg-muted/10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStarMutation.mutate(item._id)}
                      className="hover:scale-110 transition-transform"
                      title={item.starred ? "Unstar" : "Star"}
                    >
                      {item.starred ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <Star className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </button>
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5">
                      {item.inputType.toUpperCase()}
                    </span>
                    <span className="font-mono text-sm font-medium">
                      {item.input}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-lg font-bold tabular-nums ${getRiskColor(item.riskScore)}`}
                    >
                      {item.riskScore}
                    </div>
                    <div
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${getRiskBg(item.riskLevel)}`}
                    >
                      {item.riskLevel}
                    </div>
                  </div>
                </div>

                {/* Quick Info Row */}
                <div className="px-4 py-2 flex flex-wrap items-center gap-2 text-[10px] border-b border-border/20 bg-muted/5">
                  {country !== "XX" && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <ReactCountryFlag
                        countryCode={country}
                        svg
                        style={{ width: "12px", height: "8px" }}
                      />
                      <span className="text-muted-foreground">
                        {city && `${city}, `}
                        {country}
                      </span>
                    </div>
                  )}
                  {isp && (
                    <>
                      <span className="text-muted-foreground/30">|</span>
                      <div className="flex items-center gap-1.5">
                        <Server className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{isp}</span>
                      </div>
                    </>
                  )}
                  {abuseConfidence > 0 && (
                    <>
                      <span className="text-muted-foreground/30">|</span>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle
                          className={`h-3 w-3 ${abuseConfidence >= 50 ? "text-red-500" : "text-muted-foreground"}`}
                        />
                        <span
                          className={
                            abuseConfidence >= 50
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }
                        >
                          Abuse: {abuseConfidence}%
                        </span>
                      </div>
                    </>
                  )}
                  {vtMalicious > 0 && (
                    <>
                      <span className="text-muted-foreground/30">|</span>
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">VT: {vtMalicious}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* AI Summary Preview */}
                {item.aiSummary?.executiveSummary && (
                  <div className="px-4 py-2 text-xs text-muted-foreground/80 border-b border-border/20">
                    <p className="line-clamp-2">
                      {item.aiSummary.executiveSummary}
                    </p>
                  </div>
                )}

                {/* Tags Section */}
                {item.tags && item.tags.length > 0 && (
                  <div className="px-4 py-2 flex flex-wrap items-center gap-2 border-b border-border/20">
                    <span className="text-[9px] text-muted-foreground">
                      Tags:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="px-4 py-2 flex items-center justify-end gap-2 bg-muted/5">
                  <button
                    onClick={() => {
                      setSelectedAnalysis(item);
                      setEditNotes(item.notes || "");
                      setEditTags((item.tags || []).join(", "));
                    }}
                    className="p-1.5 hover:bg-muted/30 rounded transition-colors"
                    title="Edit notes & tags"
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <a
                    href={`/analysis/${item._id}`}
                    className="p-1.5 hover:bg-muted/30 rounded transition-colors"
                    title="View full analysis"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Remove this analysis from your saved collection?",
                        )
                      ) {
                        deleteMutation.mutate(item._id);
                      }
                    }}
                    className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border w-[420px] max-w-[90vw] shadow-xl">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wide">
                  Edit Saved Analysis
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="p-1 hover:bg-muted/50 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-transparent border border-border/40 focus:outline-none focus:border-primary/50 transition-colors"
                  rows={3}
                  placeholder="Add your investigation notes..."
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="malware, c2, phishing, apt"
                  className="w-full px-3 py-2 text-sm bg-transparent border border-border/40 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <p className="text-[9px] text-muted-foreground mt-1">
                  Separate tags with commas
                </p>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-border flex gap-2">
              <button
                onClick={() => {
                  updateMutation.mutate({
                    id: selectedAnalysis._id,
                    notes: editNotes,
                    tags: editTags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  });
                }}
                className="flex-1 py-2 bg-primary text-white text-[11px] font-medium hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="flex-1 py-2 bg-muted/20 text-muted-foreground text-[11px] font-medium hover:bg-muted/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
