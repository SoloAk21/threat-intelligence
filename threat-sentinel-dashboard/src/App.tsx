import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useStore } from "@/store/useStore";
import { useEffect } from "react";
import IPCheckPage from "@/pages/IPCheck";
import URLCheckPage from "@/pages/URLCheck";
import DomainCheckPage from "@/pages/DomainCheck";
import CTIPage from "@/pages/CTI";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
});

function ThemeInit() {
  const { theme } = useStore();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}

function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="mr-3" />
            <h2 className="text-sm font-semibold text-foreground">ThreatScope</h2>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/ip-check" replace />} />
              <Route path="/ip-check" element={<IPCheckPage />} />
              <Route path="/url-check" element={<URLCheckPage />} />
              <Route path="/domain-check" element={<DomainCheckPage />} />
              <Route path="/cti" element={<CTIPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInit />
      <Sonner />
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
