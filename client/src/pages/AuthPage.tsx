// src/pages/AuthPage.tsx (updated)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LogIn, UserPlus, Activity } from "lucide-react";
import { SignIn } from "../components/SignIn";
import { SignUp } from "../components/SignUp";
import { ForgotPassword } from "../components/ForgotPassword";

type AuthMode = "signin" | "signup" | "forgot";

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Ambient background with brand colors */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -right-96 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -left-96 w-[600px] h-[600px] bg-brand-secondary/5 rounded-full blur-[120px]" />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Header with Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            ThreatScope
          </h1>
          <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
            <Activity className="h-3.5 w-3.5 text-brand-primary" />
            Advanced Threat Intelligence Platform
          </p>
        </motion.div>

        {/* Auth Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Tab Headers - Hide when in forgot password mode */}
          {mode !== "forgot" && (
            <div className="flex border-b border-border/30">
              <button
                onClick={() => setMode("signin")}
                className={`flex-1 py-3.5 px-4 text-sm font-medium transition-all relative ${
                  mode === "signin"
                    ? "text-brand-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </div>
                {mode === "signin" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                  />
                )}
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-3.5 px-4 text-sm font-medium transition-all relative ${
                  mode === "signup"
                    ? "text-brand-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </div>
                {mode === "signup" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                  />
                )}
              </button>
            </div>
          )}

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "signin" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "signin" ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              {mode === "signin" && (
                <SignIn
                  onSwitchToSignUp={() => setMode("signup")}
                  onSwitchToForgotPassword={() => setMode("forgot")}
                  onSuccess={handleSuccess}
                />
              )}
              {mode === "signup" && (
                <SignUp
                  onSwitchToSignIn={() => setMode("signin")}
                  onSuccess={handleSuccess}
                />
              )}
              {mode === "forgot" && (
                <ForgotPassword onBackToSignIn={() => setMode("signin")} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
