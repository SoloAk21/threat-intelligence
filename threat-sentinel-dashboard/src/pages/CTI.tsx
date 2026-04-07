import { useStore } from "@/store/useStore";
import { Shield, Trash2, RotateCw, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CTIPage() {
  const { history, clearHistory } = useStore();
  const navigate = useNavigate();

  const reanalyze = (input: string, type: string) => {
    const routes: Record<string, string> = { ip: "/ip-check", url: "/url-check", domain: "/domain-check" };
    navigate(routes[type] || "/ip-check");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Cyber Threat Intelligence</h1>
      </div>
      <p className="text-muted-foreground">Aggregated view of all threat analyses and recent activity</p>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Analyses ({history.length})
          </h2>
          {history.length > 0 && (
            <button
              onClick={() => { if (window.confirm("Clear all search history?")) clearHistory(); }}
              className="text-sm text-muted-foreground hover:text-risk-critical transition-colors flex items-center gap-1"
              aria-label="Clear history"
            >
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No analyses yet. Start by checking an IP, URL, or domain.</p>
        ) : (
          <div className="space-y-2">
            {history.map((item, i) => {
              const riskColor = item.riskScore <= 25 ? "text-risk-low" : item.riskScore <= 50 ? "text-risk-medium" : item.riskScore <= 75 ? "text-risk-high" : "text-risk-critical";
              return (
                <motion.div
                  key={`${item.input}-${item.timestamp}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className={`text-lg font-bold w-10 text-center ${riskColor}`}>{item.riskScore}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.input}</p>
                    <p className="text-xs text-muted-foreground">{item.inputType} • {new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => reanalyze(item.input, item.inputType)}
                    className="p-1.5 rounded hover:bg-accent transition-colors"
                    aria-label={`Re-analyze ${item.input}`}
                  >
                    <RotateCw className="h-4 w-4 text-muted-foreground" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
