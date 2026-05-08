// ============================================================================
// APP.TSX - Enhanced with Premium Cyber-Intelligence Aesthetic
// Includes: Forgot Password, Reset Password, Comprehensive Error Handling
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
  Sparkles,
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

// Premium Mobile Menu component with glass-morphism styling
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
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Slide-in panel with glass effect */}
      <div className="absolute right-0 top-0 h-full w-[280px] bg-surface-0/95 backdrop-blur-xl border-l border-brand-primary/20 shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-brand-primary/10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-primary/30 blur-md rounded-full animate-glow-pulse" />
              <Shield
                className="relative h-5 w-5 text-brand-primary"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-sm font-semibold tracking-tight bg-gradient-to-r from-brand-primary to-brand-primary-light bg-clip-text text-transparent">
              ThreatScope
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 -mr-1 rounded-md hover:bg-brand-primary/10 transition-all duration-200"
            aria-label="Close menu"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <div className="text-[10px] font-semibold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Intelligence
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 group cursor-default">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-all duration-200">
                    <Database
                      className="h-3 w-3 text-brand-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                    Data Sources
                  </span>
                </div>
                <span className="text-sm font-semibold text-brand-primary">
                  25+
                </span>
              </div>
              <div className="flex items-center justify-between py-2 group cursor-default">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-all duration-200">
                    <Activity
                      className="h-3 w-3 text-brand-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                    Analysis
                  </span>
                </div>
                <span className="text-[10px] font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 animate-pulse">
                  LIVE
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-semibold text-brand-primary uppercase tracking-wider">
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
                  className="flex items-center gap-2 text-xs px-3 py-2 bg-muted/20 border border-brand-primary/10 hover:border-brand-primary/30 transition-all duration-200 group cursor-default"
                >
                  <item.icon
                    className="h-3 w-3 text-brand-primary group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={1.5}
                  />
                  <span className="text-foreground/70 group-hover:text-foreground transition-colors duration-200">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between py-2.5 px-3 bg-muted/20 border border-brand-primary/10 hover:border-brand-primary/30 rounded transition-all duration-200 group"
          >
            <div className="flex items-center gap-2.5">
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-brand-secondary group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <Moon className="h-4 w-4 text-brand-primary group-hover:scale-110 transition-transform duration-200" />
              )}
              <span className="text-xs text-foreground/70 group-hover:text-foreground transition-colors duration-200">
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200" />
          </button>

          {!isAuthenticated && (
            <a
              href="/auth"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white text-xs font-semibold rounded hover:shadow-glow-primary transition-all duration-300"
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

// Main Layout component with premium glass-header styling
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
      {/* Premium Ambient Background with glow blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Teal ambient glow - top right */}
        <div className="absolute top-0 -right-96 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px] animate-pulse" />
        {/* Yellow ambient glow - bottom left */}
        <div
          className="absolute bottom-0 -left-96 w-[600px] h-[600px] bg-brand-secondary/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        {/* Additional center subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-primary/3 rounded-full blur-[100px]" />
      </div>

      {/* ===== PREMIUM GLASS HEADER ===== */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-out ${
          scrolled
            ? "bg-surface-0/80 backdrop-blur-xl border-b border-brand-primary/20 shadow-lg"
            : "bg-surface-0/60 backdrop-blur-md border-b border-brand-primary/10"
        }`}
      >
        {/* Top edge highlight reflection */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo Section with glow effect */}
            <div className="flex items-center gap-2.5 group">
              <div className="relative">
                {/* Glow aura behind logo */}
                <div className="absolute inset-0 bg-brand-primary/40 blur-xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500" />
                <img
                  src="./tsedeylogo.png"
                  className="h-8 lg:h-9 relative z-10 transition-transform duration-300 group-hover:scale-105"
                  alt="ThreatScope"
                />
              </div>
              <div className="border-l border-brand-primary/30 h-6 lg:h-7" />
              <span className="font-semibold tracking-tight text-lg lg:text-xl text-brand-primary">
                ThreatScope
              </span>
            </div>

            {/* Desktop Stats with premium styling */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/5 border border-brand-primary/20 rounded-full hover:border-brand-primary/40 transition-all duration-200 group cursor-default">
                <Database
                  className="h-3 w-3 text-brand-primary group-hover:scale-110 transition-transform duration-200"
                  strokeWidth={1.5}
                />
                <span className="text-[10px] font-medium text-foreground/70 group-hover:text-foreground transition-colors duration-200">
                  25+ Sources
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/5 border border-brand-primary/20 rounded-full hover:border-brand-primary/40 transition-all duration-200 group cursor-default">
                <Activity
                  className="h-3 w-3 text-brand-primary group-hover:scale-110 transition-transform duration-200"
                  strokeWidth={1.5}
                />
                <span className="text-[10px] font-medium text-foreground/70 group-hover:text-foreground transition-colors duration-200 relative">
                  Live Analysis
                  <span className="absolute -top-0.5 -right-1.5 h-1.5 w-1.5 bg-brand-primary rounded-full animate-pulse" />
                </span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* Indicator Types - Premium pill */}
              <div className="hidden lg:flex items-center gap-0.5 bg-brand-primary/5 rounded-full p-0.5 border border-brand-primary/20">
                {[
                  { icon: Globe, label: "IP" },
                  { icon: Hash, label: "URL" },
                  { icon: Fingerprint, label: "Domain" },
                  { icon: Shield, label: "Hash" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full hover:bg-brand-primary/10 transition-all duration-200 cursor-default group"
                  >
                    <item.icon
                      className="h-3 w-3 text-brand-primary group-hover:scale-110 transition-transform duration-200"
                      strokeWidth={1.5}
                    />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Theme Toggle with premium hover effect */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 bg-brand-primary/5 border border-brand-primary/20 hover:border-brand-primary/40 rounded-full hover:shadow-glow-primary transition-all duration-300 group"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5 text-brand-secondary group-hover:scale-110 transition-transform duration-200" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-brand-primary group-hover:scale-110 transition-transform duration-200" />
                )}
              </button>

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="transition-all duration-300 hover:shadow-glow-primary rounded-full">
                  <UserMenu />
                </div>
              ) : (
                <a
                  href="/auth"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white text-[10px] lg:text-[11px] font-semibold rounded-full hover:shadow-glow-primary transition-all duration-300 group"
                >
                  <LogIn className="h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                  Sign in
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 bg-brand-primary/5 border border-brand-primary/20 rounded-full hover:border-brand-primary/40 hover:shadow-glow-primary transition-all duration-300"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Bottom border glow (premium effect) */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />
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

      {/* Premium Footer */}
      <footer className="relative z-10 border-t border-brand-primary/10 bg-surface-0/80 backdrop-blur-sm mt-auto">
        {/* Top edge glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex flex-col xs:flex-row items-center justify-between gap-2 text-[9px] lg:text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="flex items-center gap-1.5 group cursor-default">
                <Shield
                  className="h-3 w-3 text-brand-primary/70 group-hover:text-brand-primary transition-colors duration-200"
                  strokeWidth={1.5}
                />
                <span className="group-hover:text-foreground transition-colors duration-200">
                  © 2024 ThreatScope
                </span>
              </div>
              <span className="text-brand-primary/30 select-none hidden xs:inline">
                •
              </span>
              <div className="flex items-center gap-1.5 group cursor-default">
                <Zap
                  className="h-3 w-3 text-brand-secondary/70 group-hover:text-brand-secondary transition-colors duration-200"
                  strokeWidth={1.5}
                />
                <span className="group-hover:text-foreground transition-colors duration-200">
                  25+ Threat Intel Sources
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-brand-primary/5 border border-brand-primary/20 hover:border-brand-primary/40 transition-all duration-200 group cursor-default">
                <Network
                  className="h-2.5 w-2.5 text-brand-primary/60 group-hover:text-brand-primary transition-colors duration-200"
                  strokeWidth={1.5}
                />
                <span className="text-[8px] lg:text-[9px] group-hover:text-foreground transition-colors duration-200">
                  AbuseIPDB
                </span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-brand-secondary/5 border border-brand-secondary/20 hover:border-brand-secondary/40 transition-all duration-200 group cursor-default">
                <AlertTriangle
                  className="h-2.5 w-2.5 text-brand-secondary/70 group-hover:text-brand-secondary transition-colors duration-200"
                  strokeWidth={1.5}
                />
                <span className="text-[8px] lg:text-[9px] group-hover:text-foreground transition-colors duration-200">
                  VirusTotal
                </span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-brand-primary/5 border border-brand-primary/20 hover:border-brand-primary/40 transition-all duration-200 group cursor-default">
                <CheckCircle
                  className="h-2.5 w-2.5 text-brand-primary/70 group-hover:text-brand-primary transition-colors duration-200"
                  strokeWidth={1.5}
                />
                <span className="text-[8px] lg:text-[9px] group-hover:text-foreground transition-colors duration-200">
                  GreyNoise
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom animations style */}
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
          animation: slide-in 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        @keyframes glow-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(12, 183, 183, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(12, 183, 183, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(12, 183, 183, 0);
          }
        }
        
        .shadow-glow-primary {
          box-shadow: 0 0 15px rgba(12, 183, 183, 0.3);
        }
        
        .shadow-glow-primary:hover {
          box-shadow: 0 0 25px rgba(12, 183, 183, 0.5);
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 1.5s ease-out infinite;
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
            border: "1px solid rgba(12, 183, 183, 0.2)",
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            fontSize: "12px",
            padding: "10px 14px",
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(12, 183, 183, 0.1)",
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
