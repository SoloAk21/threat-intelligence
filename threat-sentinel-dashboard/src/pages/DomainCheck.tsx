import { z } from "zod";
import { Server } from "lucide-react";
import { AnalysisPage } from "@/components/AnalysisPage";

const domainSchema = z.string().regex(/^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, "Enter a valid domain (e.g. example.com)");

export default function DomainCheckPage() {
  return (
    <AnalysisPage
      title="Domain Check"
      description="Domain reputation and intelligence analysis"
      placeholder="e.g. example.com"
      schema={domainSchema}
      icon={<Server className="h-6 w-6 text-primary" />}
    />
  );
}
