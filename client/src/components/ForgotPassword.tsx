// src/components/ForgotPassword.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Mail, AlertCircle, ArrowLeft, Send, WifiOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";

interface ForgotPasswordProps {
  onBackToSignIn: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onBackToSignIn,
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      // Handle different error types
      let errorMessage =
        err.message || "Failed to send reset email. Please try again.";

      // Check for HTML response error (API not configured)
      if (errorMessage.includes("<!DOCTYPE") || errorMessage.includes("HTML")) {
        errorMessage =
          "Password reset is not configured yet. Please contact support or check your API settings.";
      }

      // Check for network errors
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError")
      ) {
        errorMessage =
          "Unable to connect to the server. Please check your internet connection and try again.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <Mail className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We've sent password reset instructions to{" "}
            <strong className="text-foreground">{email}</strong>
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onBackToSignIn}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={onBackToSignIn}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </button>

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Forgot password?</h3>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

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
            htmlFor="reset-email"
            className="text-xs font-medium text-muted-foreground"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-primary/40" />
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 bg-background/50 border-border/30 focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 text-sm"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium py-2 transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Sending...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span>Send Reset Link</span>
            </div>
          )}
        </Button>
      </form>

      {/* Development Mode Hint */}
      {import.meta.env.DEV && (
        <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-[10px] text-yellow-500 text-center">
            💡 Development Note: API endpoint:{" "}
            {import.meta.env.VITE_API_URL || "http://localhost:5000/api"}
            <br />
            Make sure your backend server is running and the
            /auth/forgot-password endpoint is implemented.
          </p>
        </div>
      )}
    </div>
  );
};
