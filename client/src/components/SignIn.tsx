// src/components/SignIn.tsx (updated)
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Mail, Lock, AlertCircle, LogIn } from "lucide-react";

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
  onSuccess?: () => void;
}

export const SignIn: React.FC<SignInProps> = ({
  onSwitchToSignUp,
  onSwitchToForgotPassword,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      onSuccess?.();
    } catch (err: any) {
      // Enhanced error handling
      if (err.message?.includes("email")) {
        setError("No account found with this email address");
      } else if (err.message?.includes("password")) {
        setError("Incorrect password. Please try again");
      } else if (err.message?.includes("verify")) {
        setError("Please verify your email address before signing in");
      } else {
        setError(err.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert
              variant="destructive"
              className="border-red-500/30 bg-red-500/10"
            >
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="space-y-1">
          <Label
            htmlFor="email"
            className="text-xs font-medium text-muted-foreground"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-primary/40" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 bg-background/50 border-border/30 focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="password"
            className="text-xs font-medium text-muted-foreground"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-primary/40" />
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 bg-background/50 border-border/30 focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 text-sm"
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-[10px] text-brand-primary hover:text-brand-primary/80 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium py-2 transition-all duration-200 mt-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </div>
          )}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/30"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-card/50 text-muted-foreground">
              New to ThreatScope?
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="w-full text-center text-sm text-brand-primary hover:text-brand-primary/80 transition-colors font-medium"
        >
          Create an account →
        </button>
      </form>
    </div>
  );
};
