// src/app/ip-check/page.tsx
import { z } from "zod";
import { Globe } from "lucide-react";
import { AnalysisPage } from "@/components/AnalysisPage";

const ipSchema = z
  .string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    "Enter a valid IPv4 address",
  );

export default function IPCheckPage() {
  return (
    <AnalysisPage
      title="IP Address Check"
      description="Analyze IPv4 addresses against multiple threat intelligence sources"
      placeholder="e.g. 8.8.8.8 or 66.132.153.142"
      schema={ipSchema}
      icon={<Globe className="h-3.5 w-3.5 text-primary/70" />}
    />
  );
}
