// src/components/Layout.tsx
import { Toaster } from "sonner";
import { Shield } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/20 px-4 py-2 sticky top-0 bg-background/95 backdrop-blur-sm z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold tracking-tight">
                ThreatScope
              </span>
              <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 bg-muted/30 rounded">
                v1.0
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span>25+ Sources</span>
              <span>IP • URL • Domain • Hash</span>
            </div>
          </div>
        </header>
        <main className="relative">{children}</main>
      </div>
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  );
}
