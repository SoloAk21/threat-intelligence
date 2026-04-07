import { z } from "zod";
import { Link2 } from "lucide-react";
import { AnalysisPage } from "@/components/AnalysisPage";

const urlSchema = z.string().url("Enter a valid URL (include https://)");

export default function URLCheckPage() {
  return (
    <AnalysisPage
      title="URL Check"
      description="Scan URLs for malicious content and threat indicators"
      placeholder="e.g. https://example.com/path"
      schema={urlSchema}
      icon={<Link2 className="h-6 w-6 text-primary" />}
    />
  );
}
