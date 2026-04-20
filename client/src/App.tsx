import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
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
  BarChart3,
  Zap,
  Menu,
  X,
  ChevronRight,
  Network,
  AlertTriangle,
  CheckCircle,
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
    root.classList.toggle("dark", theme === "dark");
    // Apply theme color to meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#0f172a" : "#ffffff",
      );
    }
  }, [theme]);
  return null;
}

function AuthInit() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return null;
}

// Mobile menu component
function MobileMenu({ isOpen, onClose, theme, toggleTheme, isAuthenticated }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Menu Panel */}
      <div className="absolute right-0 top-0 h-full w-64 bg-surface-0 border-l border-border shadow-xl animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-primary" />
            <span className="text-sm font-bold tracking-tight text-foreground">
              ThreatScope
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-brand-primary/10 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Stats Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[10px] text-muted-foreground">
                  Sources
                </span>
              </div>
              <span className="text-[11px] font-bold text-foreground">25+</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[10px] text-muted-foreground">
                  Threat Intel
                </span>
              </div>
              <span className="text-[11px] font-bold text-foreground">
                Real-time
              </span>
            </div>
          </div>

          {/* Supported Types */}
          <div className="space-y-2">
            <div className="text-[9px] font-bold text-brand-primary uppercase tracking-wider">
              Supported Types
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 text-[9px] px-2 py-1 bg-brand-primary/10 text-brand-primary-dark border border-brand-primary/20">
                <Globe className="h-2.5 w-2.5" />
                IP
              </div>
              <div className="flex items-center gap-1 text-[9px] px-2 py-1 bg-brand-primary/10 text-brand-primary-dark border border-brand-primary/20">
                <Hash className="h-2.5 w-2.5" />
                URL
              </div>
              <div className="flex items-center gap-1 text-[9px] px-2 py-1 bg-brand-primary/10 text-brand-primary-dark border border-brand-primary/20">
                <Fingerprint className="h-2.5 w-2.5" />
                Domain
              </div>
              <div className="flex items-center gap-1 text-[9px] px-2 py-1 bg-brand-primary/10 text-brand-primary-dark border border-brand-primary/20">
                <Shield className="h-2.5 w-2.5" />
                Hash
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between py-2 px-3 bg-surface-1 border border-border/30 hover:bg-brand-primary/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-brand-secondary" />
              ) : (
                <Moon className="h-4 w-4 text-brand-primary" />
              )}
              <span className="text-[10px] text-foreground">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </div>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </button>

          {/* Auth Button */}
          {!isAuthenticated && (
            <a
              href="/auth"
              className="w-full flex items-center justify-center gap-2 py-2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary-dark transition-all duration-150"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Layout() {
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-brand-primary/5">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-brand-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-brand-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/20 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-primary/20 blur-md rounded-full" />
                <div className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-primary-dark border border-brand-primary/30">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    ThreatScope
                  </span>
                  <span className="text-[8px] font-mono text-brand-primary-dark bg-brand-primary/10 px-1.5 py-0.5 border border-brand-primary/20">
                    v1.0
                  </span>
                </div>
                <div className="text-[8px] text-muted-foreground hidden sm:block">
                  Advanced Threat Intelligence Platform
                </div>
              </div>
            </div>

            {/* Desktop Stats */}
            <div className="hidden md:flex items-center gap-6 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/5 border border-brand-primary/20">
                <Database className="h-3 w-3 text-brand-primary" />
                <span className="font-medium">25+ Intelligence Sources</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/5 border border-brand-primary/20">
                <Activity className="h-3 w-3 text-brand-primary" />
                <span className="font-medium">Real-time Analysis</span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Supported Types */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 text-[9px] px-2 py-1 bg-surface-1 border border-border/30">
                  <Globe className="h-3 w-3 text-brand-primary" />
                  <span className="text-muted-foreground">IP</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] px-2 py-1 bg-surface-1 border border-border/30">
                  <Hash className="h-3 w-3 text-brand-primary" />
                  <span className="text-muted-foreground">URL</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] px-2 py-1 bg-surface-1 border border-border/30">
                  <Fingerprint className="h-3 w-3 text-brand-primary" />
                  <span className="text-muted-foreground">Domain</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] px-2 py-1 bg-surface-1 border border-border/30">
                  <Shield className="h-3 w-3 text-brand-primary" />
                  <span className="text-muted-foreground">Hash</span>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-7 h-7 bg-surface-1 border border-border/30 hover:bg-brand-primary/10 hover:border-brand-primary/30 transition-all duration-200 group"
              >
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5 text-brand-secondary group-hover:scale-110 transition-transform" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-brand-primary group-hover:scale-110 transition-transform" />
                )}
              </button>

              {/* User Menu or Sign In Button */}
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <a
                  href="/auth"
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary-dark transition-all duration-150 shadow-sm group"
                >
                  <LogIn className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  Sign In
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 bg-surface-1 border border-border/30 hover:bg-brand-primary/10 transition-colors"
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
      <main className="relative z-10 flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UnifiedAnalysisPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/20 bg-background/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-brand-primary" />
                <span>© 2024 ThreatScope</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-brand-secondary" />
                <span>Powered by 25+ Threat Intelligence Sources</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Network className="h-3 w-3 text-brand-primary/60" />
                <span>AbuseIPDB</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-risk-high" />
                <span>VirusTotal</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-risk-low" />
                <span>GreyNoise</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Add animation keyframes */}
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
          animation: slide-in 0.2s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInit />
      <AuthInit />
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: "0px",
            borderLeft: "4px solid var(--brand-primary)",
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
