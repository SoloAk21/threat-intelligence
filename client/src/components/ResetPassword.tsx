// src/components/ResetPassword.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const { resetPassword, verifyResetToken } = useAuthStore();

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setError("Invalid or missing reset token");
        return;
      }

      try {
        const isValid = await verifyResetToken(token);
        setTokenValid(isValid);
        if (!isValid) {
          setError("Reset link has expired or is invalid");
        }
      } catch (err: any) {
        setTokenValid(false);
        setError(err.message || "Failed to verify reset token");
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      if (!token) throw new Error("No reset token provided");
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Token validation loading
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl p-6 text-center"
        >
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Invalid Reset Link</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {error || "This password reset link is invalid or has expired."}
          </p>
          <Button onClick={() => navigate("/auth")} className="w-full">
            Back to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl p-6 text-center"
        >
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Password Reset Successful
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Your password has been reset successfully. Redirecting to sign in...
          </p>
          <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2 text-center">
            Create New Password
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Please enter your new password below.
          </p>

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
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <div className="space-y-1">
              <Label
                htmlFor="new-password"
                className="text-xs font-medium text-muted-foreground"
              >
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-primary/40" />
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-background/50 border-border/30 focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 text-sm"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="confirm-password"
                className="text-xs font-medium text-muted-foreground"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-primary/40" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 bg-background/50 border-border/30 focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 text-sm"
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[10px] text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium py-2 transition-all duration-200 mt-4"
              disabled={isLoading || !!error}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Resetting password...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Reset Password</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
