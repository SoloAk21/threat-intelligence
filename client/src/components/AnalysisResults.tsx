// src/components/AnalysisResults.tsx
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import type { ThreatData } from "@/types/threat";
import { ThreatSummaryCard } from "./ThreatSummaryCard";

// IP Cards
import { AbuseIPDBCard } from "./cards/AbuseIPDBCard";
import { GreyNoiseCard } from "./cards/GreyNoiseCard";
import { CensysCard } from "./cards/CensysCard";
import { IPInfoCard } from "./cards/IPInfoCard";
import { IPQualityScoreCard } from "./cards/IPQualityScoreCard";
import { IPifyCard } from "./cards/IPifyCard";
import { VPNAPICard } from "./cards/VPNAPICard";
import { IPTeohCard } from "./cards/IPTeohCard";

// Universal Cards
import { VirusTotalCard } from "./cards/VirusTotalCard";
import { OTXCard } from "./cards/OTXCard";
import { PulsediveCard } from "./cards/PulsediveCard";
import { InQuestCard } from "./cards/InQuestCard";

// URL/Domain Cards
import { URLScanCard } from "./cards/URLScanCard";
import { URLHausCard } from "./cards/URLHausCard";
import { SucuriCard } from "./cards/SucuriCard";
import { log } from "console";

export function AnalysisResults({ data }: { data: ThreatData }) {
  const inputType = data.inputType || "ip";
  const isIP = inputType === "ip";
  const isURL = inputType === "url";
  const isDomain = inputType === "domain";
  const isHash = inputType === "hash";
  console.log("ThreatData", data);

  const availableCards = [
    // VirusTotal (always show if available)
    {
      id: "vt",
      condition: data.vt && Object.keys(data.vt).length > 0,
      component: <VirusTotalCard data={data.vt!} />,
    },
    // OTX (always show)
    {
      id: "otx",
      condition: data.otx && data.otx.pulse_count !== undefined,
      component: <OTXCard data={data.otx!} />,
    },
    // Pulsedive
    {
      id: "pulsedive",
      condition: data.pulsedive && Object.keys(data.pulsedive).length > 0,
      component: <PulsediveCard data={data.pulsedive!} />,
    },
    // InQuest
    {
      id: "inquest",
      condition: data.inquest && data.inquest.reputation_hits !== undefined,
      component: <InQuestCard data={data.inquest!} />,
    },
    // IP-specific cards
    {
      id: "abuseipdb",
      condition:
        isIP && data.abuseipdb && Object.keys(data.abuseipdb).length > 0,
      component: <AbuseIPDBCard data={data.abuseipdb!} />,
    },
    {
      id: "greynoise",
      condition:
        isIP && data.greynoise && Object.keys(data.greynoise).length > 0,
      component: <GreyNoiseCard data={data.greynoise!} />,
    },
    {
      id: "censys",
      condition:
        isIP && data.censys?.services && data.censys.services.length > 0,
      component: <CensysCard data={data.censys!} />,
    },
    {
      id: "ipinfo",
      condition: isIP && data.ipinfo?.ip,
      component: <IPInfoCard data={data.ipinfo!} />,
    },
    {
      id: "ipqualityscore",
      condition:
        isIP &&
        data.ipqualityscore &&
        Object.keys(data.ipqualityscore).length > 0,
      component: <IPQualityScoreCard data={data.ipqualityscore!} />,
    },
    {
      id: "ipify",
      condition: isIP && data.ipify && Object.keys(data.ipify).length > 0,
      component: <IPifyCard data={data.ipify!} />,
    },
    {
      id: "vpnapi",
      condition: isIP && data.vpnapi && Object.keys(data.vpnapi).length > 0,
      component: <VPNAPICard data={data.vpnapi!} />,
    },
    {
      id: "ipteoh",
      condition: isIP && data.ipteoh && Object.keys(data.ipteoh).length > 0,
      component: <IPTeohCard data={data.ipteoh!} />,
    },
    // URL-specific cards
    {
      id: "urlscan",
      condition:
        (isURL || isDomain) &&
        data.urlscan &&
        Object.keys(data.urlscan).length > 0,
      component: <URLScanCard data={data.urlscan!} />,
    },
    {
      id: "urlhaus",
      condition:
        (isURL || isHash) &&
        data.urlhaus &&
        Object.keys(data.urlhaus).length > 0,
      component: <URLHausCard data={data.urlhaus!} />,
    },
    // Domain-specific cards
    {
      id: "sucuri",
      condition:
        (isURL || isDomain) &&
        data.sucuri &&
        Object.keys(data.sucuri).length > 0,
      component: <SucuriCard data={data.sucuri!} />,
    },
  ];

  const visibleCards = availableCards.filter((card) => card.condition);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-3 px-3 py-3"
    >
      {/* Unified Threat Summary Card */}
      <ThreatSummaryCard data={data} showActions={true} />

      {/* Intelligence Cards Grid */}
      {visibleCards.length > 0 && (
        <div className="space-y-3">
          {visibleCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              {card.component}
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {visibleCards.length === 0 && (
        <div className="bg-card border border-border/20 py-8">
          <div className="text-center">
            <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No intelligence data available
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
