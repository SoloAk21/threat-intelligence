import { motion } from "framer-motion";
import { MapPin, Clock, List, Bug } from "lucide-react";
import type { IPInfoData, MultiRBLData, ThreatFoxData } from "@/types/threat";

interface Props {
  ipinfo: IPInfoData;
  multirbl: MultiRBLData;
  threatfox: ThreatFoxData;
  timestamp: string;
}

export function AdditionalIntelCard({ ipinfo, multirbl, threatfox, timestamp }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Additional Intelligence</h3>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm space-y-1">
            <p className="font-medium text-foreground">Geolocation</p>
            <p className="text-muted-foreground">
              {[ipinfo.city, ipinfo.region, ipinfo.country].filter(Boolean).join(", ") || "N/A"}
            </p>
            <p className="text-muted-foreground">{ipinfo.org || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <List className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">MultiRBL</p>
            <p className="text-muted-foreground">
              Listed on <span className={`font-semibold ${multirbl.listedCount > 0 ? "text-risk-critical" : "text-risk-low"}`}>{multirbl.listedCount}</span>
              {" / "}{multirbl.totalChecked} blacklists
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Bug className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">ThreatFox</p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{threatfox.ioc_count}</span> IOC(s) found
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Clock className="h-5 w-5 text-primary shrink-0" />
          <span>Analyzed: {new Date(timestamp).toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
