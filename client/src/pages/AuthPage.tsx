import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LogIn, UserPlus, Sparkles } from "lucide-react";
import { SignIn } from "../components/SignIn";
import { SignUp } from "../components/SignUp";

export const AuthPage: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Header with Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-50"></div>
              <Shield className="relative h-16 w-16 text-purple-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ThreatScope
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Advanced Threat Intelligence Platform
          </p>
        </motion.div>

        {/* Auth Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-card/50 backdrop-blur-sm border border-border/30 shadow-2xl"
        >
          {/* Tab Headers */}
          <div className="flex border-b border-border/30">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all relative ${
                isSignIn
                  ? "text-purple-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </div>
              {isSignIn && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                />
              )}
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all relative ${
                !isSignIn
                  ? "text-purple-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </div>
              {!isSignIn && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                />
              )}
            </button>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignIn ? "signin" : "signup"}
              initial={{ opacity: 0, x: isSignIn ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignIn ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              {isSignIn ? (
                <SignIn
                  onSwitchToSignUp={() => setIsSignIn(false)}
                  onSuccess={handleSuccess}
                />
              ) : (
                <SignUp
                  onSwitchToSignIn={() => setIsSignIn(true)}
                  onSuccess={handleSuccess}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Powered by 25+ Threat Intelligence Sources
        </motion.p>
      </div>
    </div>
  );
};
