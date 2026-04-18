import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { UnifiedAnalysisPage } from "@/components/UnifiedAnalysisPage";
import { AuthPage } from "@/pages/AuthPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserMenu } from "@/components/UserMenu";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function ThemeInit() {
  const { theme } = useStore();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
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

function Layout() {
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Auth */}
      <header className="border-b border-border/20 px-4 py-2 sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
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

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="px-2 py-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {/* User Menu or Sign In Button */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <a
                href="/auth"
                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
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
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInit />
      <AuthInit />
      <Toaster position="bottom-right" richColors />
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
