// src/components/AnalysisPage.tsx
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Search, Loader2, Shield, Target, CornerDownLeft } from "lucide-react";
import { toast } from "sonner";
import { analyzeInput } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { AnalysisResults } from "@/components/AnalysisResults";
import { ResultSkeleton } from "@/components/ResultSkeleton";
import type { ThreatData } from "@/types/threat";

interface AnalysisPageProps {
  title: string;
  description: string;
  placeholder: string;
  schema: z.ZodSchema;
  icon: React.ReactNode;
}

export function AnalysisPage({
  title,
  description,
  placeholder,
  schema,
  icon,
}: AnalysisPageProps) {
  const [result, setResult] = useState<ThreatData | null>(null);
  const { addToHistory } = useStore();

  const formSchema = z.object({ input: schema });
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<{ input: string }>({
    resolver: zodResolver(formSchema),
  });

  const currentInput = watch("input");

  const mutation = useMutation({
    mutationFn: (input: string) => analyzeInput(input),
    onSuccess: (response) => {
      if (response?.data && response.data.input) {
        setResult(response.data);
        addToHistory(response.data);
        toast.success("Analysis complete");
      } else {
        console.error("Invalid response data:", response);
        toast.error("Received invalid data from server");
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Analysis failed");
    },
  });

  const onSubmit = useCallback(
    (data: { input: string }) => {
      mutation.mutate(data.input);
    },
    [mutation],
  );

  return (
    <div className="max-w-6xl mx-auto space-y-3 px-3 py-3 animate-fade-in">
      {/* Unified Card - Everything in one */}
      <div className="bg-card border-l-2 border-primary/60">
        {/* Header Row */}
        <div className="px-3 py-2 border-b border-border/20 flex items-center gap-2 bg-muted/5">
          <div className="flex items-center gap-1.5">
            {icon}
            <span className="text-[11px] font-semibold tracking-tight text-foreground/80 uppercase">
              {title}
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30">
            Threat Intel
          </span>
          <span className="text-[10px] text-muted-foreground/60 ml-auto">
            {description}
          </span>
        </div>

        {/* Input Row with Button Inside */}
        <div className="px-3 py-2">
          <form onSubmit={handleSubmit(onSubmit)} className="relative">
            <input
              {...register("input")}
              placeholder={placeholder}
              className="w-full bg-background/50 border border-border/30 pl-2 pr-20 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
              aria-label={`Enter ${title.toLowerCase()}`}
              autoComplete="off"
              spellCheck="false"
            />

            {/* Button inside input */}
            <button
              type="submit"
              disabled={mutation.isPending || !currentInput}
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-0.5 bg-primary/10 border border-primary/30 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
              aria-label="Analyze"
            >
              {mutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Search className="h-3 w-3" />
              )}
              <span>Analyze</span>
            </button>

            {/* Error message */}
            {errors.input && (
              <div className="absolute -bottom-4 left-0 text-[9px] text-red-500 flex items-center gap-1">
                <Shield className="h-2 w-2" />
                {errors.input.message as string}
              </div>
            )}
          </form>

          {/* Hint row */}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground/40">
              <CornerDownLeft className="h-2.5 w-2.5" />
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
      </div>

      {/* Results Section */}
      {mutation.isPending && <ResultSkeleton />}
      {result && !mutation.isPending && <AnalysisResults data={result} />}

      {/* Empty State */}
      {!result && !mutation.isPending && (
        <div className="bg-card border border-border/20 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 border border-border/30 bg-muted/10 mb-2">
              <Target className="h-4 w-4 text-muted-foreground/30" />
            </div>
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">
              Ready for analysis
            </p>
            <p className="text-[9px] text-muted-foreground/40 mt-0.5">
              Enter target above to begin
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
