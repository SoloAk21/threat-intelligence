// src/components/UnifiedAnalysisPage.tsx
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  Search,
  Loader2,
  Shield,
  CornerDownLeft,
  Globe,
  Link2,
  Server,
  Hash,
  Mail,
  Sparkles,
  Clock,
  Trash2,
  RotateCw,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { analyzeInput } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { AnalysisResults } from "@/components/AnalysisResults";
import { ResultSkeleton } from "@/components/ResultSkeleton";
import { detectInputType } from "@/lib/inputDetector";
import type { ThreatData } from "@/types/threat";

export function UnifiedAnalysisPage() {
  const [result, setResult] = useState<ThreatData | null>(null);
  const [tempId, setTempId] = useState<string | null>(null);
  const [detectedType, setDetectedType] = useState<
    "ip" | "url" | "domain" | "hash" | "email" | "unknown" | ""
  >("");
  const { history, addToHistory, clearHistory } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<{ input: string }>({
    defaultValues: { input: "" },
  });

  const currentInput = watch("input");

  useEffect(() => {
    if (currentInput?.trim()) {
      const type = detectInputType(currentInput.trim());
      setDetectedType(type);
    } else {
      setDetectedType("");
    }
  }, [currentInput]);

  const mutation = useMutation({
    mutationFn: (input: string) => analyzeInput(input),
    onSuccess: (response) => {
      if (response?.success && response.data) {
        // Store the temporary ID and transform the data for display
        setTempId(response.tempId);

        // Add analysisId to the data for reference
        const analysisData: ThreatData = {
          ...response.data,
          analysisId: response.tempId,
          inputType: response.data.type as any,
        };

        setResult(analysisData);
        addToHistory(analysisData);

        toast.success("Analysis complete", {
          description:
            response.message || `${analysisData.riskLevel} risk detected`,
        });
      } else {
        toast.error("Received invalid data from server");
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Analysis failed");
    },
  });

  const onSubmit = useCallback(
    (data: { input: string }) => {
      if (!data.input?.trim()) return;
      // Clear previous result when new analysis starts
      setResult(null);
      setTempId(null);
      mutation.mutate(data.input.trim());
    },
    [mutation],
  );

  const reanalyze = (input: string) => {
    setValue("input", input);
    setResult(null);
    setTempId(null);
    mutation.mutate(input);
  };

  const getTypeIcon = () => {
    switch (detectedType) {
      case "ip":
        return <Globe className="h-3.5 w-3.5 text-primary/70" />;
      case "url":
        return <Link2 className="h-3.5 w-3.5 text-primary/70" />;
      case "domain":
        return <Server className="h-3.5 w-3.5 text-primary/70" />;
      case "hash":
        return <Hash className="h-3.5 w-3.5 text-primary/70" />;
      case "email":
        return <Mail className="h-3.5 w-3.5 text-primary/70" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-primary/70" />;
    }
  };

  const getTypeLabel = () => {
    switch (detectedType) {
      case "ip":
        return "IP Address";
      case "url":
        return "URL";
      case "domain":
        return "Domain";
      case "hash":
        return "File Hash";
      case "email":
        return "Email";
      default:
        return "Detecting...";
    }
  };

  const getPlaceholder = () => {
    if (detectedType === "ip") return "e.g. 8.8.8.8 or 45.79.181.104";
    if (detectedType === "url") return "e.g. https://evil.com/malware";
    if (detectedType === "domain") return "e.g. suspicious-domain.com";
    if (detectedType === "hash")
      return "e.g. d41d8cd98f00b204e9800998ecf8427e... (MD5/SHA1/SHA256)";
    if (detectedType === "email") return "e.g. spam@malicious.com";
    return "Enter IP, URL, domain, or file hash...";
  };

  const examples = [
    { type: "IP", value: "8.8.8.8", icon: Globe },
    { type: "URL", value: "evil.com/malware", icon: Link2 },
    { type: "Domain", value: "example.org", icon: Server },
    { type: "Hash", value: "d41d8cd98f00b204e9800998ecf8427e", icon: Hash },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 75) return "text-red-500";
    if (score >= 50) return "text-orange-500";
    if (score >= 25) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 px-3 py-3 animate-fade-in">
      <div className="bg-card border-l-2 border-primary/60">
        <div className="px-3 py-2 border-b border-border/20 flex items-center gap-2 bg-muted/5">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-primary/70" />
            <span className="text-sm font-semibold tracking-tight text-foreground/80 uppercase">
              Threat Analysis
            </span>
          </div>
          {detectedType && (
            <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-primary/10 border border-primary/30 flex items-center gap-1">
              {getTypeIcon()}
              {getTypeLabel()}
            </span>
          )}
          <span className="text-[9px] text-muted-foreground/50 ml-auto">
            Auto-detection enabled
          </span>
        </div>

        <div className="px-3 py-3">
          <form onSubmit={handleSubmit(onSubmit)} className="relative">
            <input
              {...register("input", {
                validate: (value) => {
                  if (!value?.trim()) return "Input is required";
                  const type = detectInputType(value.trim());
                  if (type === "unknown") return "Unrecognized format";
                  return true;
                },
              })}
              placeholder={getPlaceholder()}
              className="w-full bg-background/50 border border-border pl-3 pr-24 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
              autoComplete="off"
              spellCheck="false"
            />

            <button
              type="submit"
              disabled={mutation.isPending || !currentInput?.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-[11px] font-medium hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {mutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
              <span>Analyze</span>
            </button>

            {errors.input && (
              <div className="absolute -bottom-5 left-0 text-[10px] text-red-500 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {errors.input.message}
              </div>
            )}
          </form>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground/40">
              <CornerDownLeft className="h-3 w-3" />
              <span>Press Enter to analyze</span>
            </div>
            {currentInput && (
              <div className="text-[9px] text-muted-foreground/40">
                Target:{" "}
                <span className="font-mono text-muted-foreground/60">
                  {currentInput}
                </span>
              </div>
            )}
          </div>
        </div>

        {!currentInput && (
          <div className="px-3 pb-2 flex items-center gap-2 text-[9px] border-t border-border/20 pt-2">
            <span className="text-muted-foreground/50">Try:</span>
            {examples.map((ex) => (
              <button
                key={ex.type}
                onClick={() => setValue("input", ex.value)}
                className="flex items-center gap-1 px-2 py-0.5 bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ex.icon className="h-3 w-3" />
                <span className="font-mono">{ex.value}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && !result && !mutation.isPending && (
        <div className="bg-card border border-border/20">
          <div className="px-3 py-2 border-b border-border/20 bg-muted/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              <span className="text-[11px] font-semibold text-foreground/80 uppercase">
                Recent Analyses ({history.length})
              </span>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Clear all history?")) clearHistory();
              }}
              className="text-[9px] text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
          <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
            {history.slice(0, 10).map((item, i) => {
              const riskColor = getRiskColor(item.riskScore);
              return (
                <motion.div
                  key={`${item.input}-${item.timestamp}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 px-2 py-1.5 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => reanalyze(item.input)}
                >
                  <span
                    className={`text-sm font-bold w-8 text-center ${riskColor}`}
                  >
                    {item.riskScore}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-foreground truncate">
                      {item.input}
                    </p>
                    <p className="text-[8px] text-muted-foreground">
                      {item.inputType} •{" "}
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      reanalyze(item.input);
                    }}
                    className="p-1 hover:bg-muted/50"
                  >
                    <RotateCw className="h-3 w-3 text-muted-foreground" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {mutation.isPending && <ResultSkeleton />}

      {result && !mutation.isPending && <AnalysisResults data={result} />}

      {!result && !mutation.isPending && history.length === 0 && (
        <div className="bg-card border border-border/20 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 border border-border/30 bg-muted/10 mb-4">
              <Sparkles className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">
              Threat Intelligence Platform
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-2">
              Enter any IP, URL, domain, or file hash to begin analysis
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-[9px] text-muted-foreground/30">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" /> VirusTotal
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" /> AlienVault OTX
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" /> AbuseIPDB
              </span>
              <span className="flex items-center gap-1">
                <Server className="h-3 w-3" /> GreyNoise
              </span>
              <span>+20 more</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
