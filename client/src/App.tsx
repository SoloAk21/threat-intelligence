// ============================================================================
// APP.TSX - Complete with consistent color branding
// ============================================================================
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState, useCallback } from "react";
import { UnifiedAnalysisPage } from "@/components/UnifiedAnalysisPage";
import { AuthPage } from "@/pages/AuthPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserMenu } from "@/components/UserMenu";
import NotFound from "@/pages/NotFound";
import {
  Shield,
  Sun,
  Moon,
  LogIn,
  Activity,
  Database,
  Globe,
  Hash,
  Fingerprint,
  Zap,
  Menu,
  X,
  ChevronRight,
  Network,
  AlertTriangle,
  CheckCircle,
  Cpu,
  ShieldCheck,
} from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeInit() {
  const { theme } = useStore();
  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDark ? "#09090b" : "#fafafa");
    }
  }, [theme]);
  return null;
}

function AuthInit() {
  const { checkAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  return null;
}

// Mobile menu component with consistent branding
function MobileMenu({ isOpen, onClose, theme, toggleTheme, isAuthenticated }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-[280px] bg-background border-l border-border shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-primary/20 blur-md rounded-full" />
              <Shield
                className="relative h-5 w-5 text-brand-primary"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-sm font-medium tracking-tight text-foreground">
              ThreatScope
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 -mr-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <div className="text-[10px] font-medium text-brand-primary uppercase tracking-wide">
              Intelligence
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-brand-primary/10 flex items-center justify-center">
                    <Database
                      className="h-3 w-3 text-brand-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Data Sources
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">25+</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-brand-primary/10 flex items-center justify-center">
                    <Activity
                      className="h-3 w-3 text-brand-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Analysis
                  </span>
                </div>
                <span className="text-[10px] font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                  Live
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-medium text-brand-primary uppercase tracking-wide">
              Indicators
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { icon: Globe, label: "IP", color: "text-brand-primary" },
                { icon: Hash, label: "URL", color: "text-brand-primary" },
                {
                  icon: Fingerprint,
                  label: "Domain",
                  color: "text-brand-primary",
                },
                { icon: Shield, label: "Hash", color: "text-brand-primary" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs px-3 py-2 bg-muted/20 border border-border/20 rounded"
                >
                  <item.icon
                    className="h-3 w-3 text-brand-primary"
                    strokeWidth={1.5}
                  />
                  <span className="text-foreground/80">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between py-2.5 px-3 bg-muted/20 border border-border/20 rounded hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-brand-secondary" />
              ) : (
                <Moon className="h-4 w-4 text-brand-primary" />
              )}
              <span className="text-xs text-foreground">
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {!isAuthenticated && (
            <a
              href="/auth"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-primary text-white text-xs font-medium rounded hover:bg-brand-primary/90 transition-all duration-200"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign in
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Layout component with consistent branding
function Layout() {
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 5);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-brand-primary/20 selection:text-foreground">
      {/* Ambient background with brand colors */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -right-96 w-[600px] h-[600px] bg-brand-primary/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -left-96 w-[600px] h-[600px] bg-brand-secondary/3 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-background/90 backdrop-blur-lg border-b border-border/30"
            : "bg-background/70 backdrop-blur-sm border-b border-border/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-primary/20 blur-md rounded-lg" />
                <div className="relative flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-lg shadow-sm">
                  <Shield
                    className="h-4 w-4 lg:h-4.5 lg:w-4.5 text-white"
                    strokeWidth={1.75}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm lg:text-base font-semibold tracking-tight text-foreground">
                    ThreatScope
                  </span>
                  <span className="hidden xs:inline-block text-[8px] lg:text-[9px] font-mono text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded border border-brand-primary/20">
                    BETA
                  </span>
                </div>
                <div className="hidden sm:block text-[8px] lg:text-[9px] text-muted-foreground tracking-wide">
                  Threat Intelligence Platform
                </div>
              </div>
            </div>

            {/* Desktop Stats with brand colors */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/5 border border-brand-primary/20 rounded-full">
                <Database
                  className="h-3 w-3 text-brand-primary"
                  strokeWidth={1.5}
                />
                <span className="text-[10px] font-medium text-foreground/70">
                  25+ Sources
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/5 border border-brand-primary/20 rounded-full">
                <Activity
                  className="h-3 w-3 text-brand-primary"
                  strokeWidth={1.5}
                />
                <span className="text-[10px] font-medium text-foreground/70">
                  Live Analysis
                </span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* Indicator Types with brand colors */}
              <div className="hidden lg:flex items-center gap-1 bg-brand-primary/5 rounded-full p-0.5 border border-brand-primary/20">
                {[
                  { icon: Globe, label: "IP" },
                  { icon: Hash, label: "URL" },
                  { icon: Fingerprint, label: "Domain" },
                  { icon: Shield, label: "Hash" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full hover:bg-brand-primary/10 transition-colors cursor-default"
                  >
                    <item.icon
                      className="h-3 w-3 text-brand-primary"
                      strokeWidth={1.5}
                    />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Theme Toggle with brand colors */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-brand-primary/5 border border-brand-primary/20 hover:bg-brand-primary/10 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5 text-brand-secondary" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-brand-primary" />
                )}
              </button>

              {/* Auth Section */}
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <a
                  href="/auth"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-primary text-white text-[10px] lg:text-[11px] font-medium rounded-full hover:bg-brand-primary/90 transition-all duration-200 shadow-sm"
                >
                  <LogIn className="h-3 w-3" />
                  Sign in
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/5 border border-brand-primary/20 hover:bg-brand-primary/10 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
      />

      {/* Main Content */}
      <main className="relative z-10 pt-14 lg:pt-16 min-h-[calc(100vh-3.5rem)]">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UnifiedAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer with brand colors */}
      <footer className="relative z-10 border-t border-border/30 bg-background/80 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex flex-col xs:flex-row items-center justify-between gap-2 text-[9px] lg:text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="flex items-center gap-1.5">
                <Shield
                  className="h-3 w-3 text-brand-primary/70"
                  strokeWidth={1.5}
                />
                <span>© 2024 ThreatScope</span>
              </div>
              <span className="text-border/50 select-none hidden xs:inline">
                •
              </span>
              <div className="flex items-center gap-1.5">
                <Zap
                  className="h-3 w-3 text-brand-secondary/70"
                  strokeWidth={1.5}
                />
                <span>25+ Threat Intel Sources</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-brand-primary/5 border border-brand-primary/20">
                <Network
                  className="h-2.5 w-2.5 text-brand-primary/60"
                  strokeWidth={1.5}
                />
                <span className="text-[8px] lg:text-[9px]">AbuseIPDB</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-brand-secondary/5 border border-brand-secondary/20">
                <AlertTriangle
                  className="h-2.5 w-2.5 text-brand-secondary/70"
                  strokeWidth={1.5}
                />
                <span className="text-[8px] lg:text-[9px]">VirusTotal</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-brand-primary/5 border border-brand-primary/20">
                <CheckCircle
                  className="h-2.5 w-2.5 text-brand-primary/70"
                  strokeWidth={1.5}
                />
                <span className="text-[8px] lg:text-[9px]">GreyNoise</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        @media (min-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={150} skipDelayDuration={300}>
      <ThemeInit />
      <AuthInit />
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            borderRadius: "10px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            fontSize: "12px",
            padding: "10px 14px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          },
        }}
      />
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
