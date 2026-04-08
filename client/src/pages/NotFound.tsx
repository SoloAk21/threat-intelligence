// src/pages/NotFound.tsx
import { Link } from "react-router-dom";
import { Shield, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
      <p className="text-muted-foreground mb-6">Page not found</p>
      <Link
        to="/"
        className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
      >
        <Home className="h-4 w-4" />
        Return Home
      </Link>
    </div>
  );
}
