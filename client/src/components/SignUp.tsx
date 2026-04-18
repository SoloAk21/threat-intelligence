import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

interface SignUpProps {
  onSwitchToSignIn: () => void;
  onSuccess?: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({
  onSwitchToSignIn,
  onSuccess,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthStore();

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const checkPasswordStrength = (pwd: string) => {
    const checks = {
      length: pwd.length >= 6,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
    };
    setPasswordChecks(checks);
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
    return strength;
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    checkPasswordStrength(pwd);
  };

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
      await signup(username, email, password);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-muted/30";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "No password";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-3">
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
            htmlFor="username"
            className="text-xs font-medium text-muted-foreground"
          >
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-9 bg-background/50 border-border/30 focus:border-purple-500/50 text-sm"
              required
              minLength={3}
              maxLength={30}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="email"
            className="text-xs font-medium text-muted-foreground"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 bg-background/50 border-border/30 focus:border-purple-500/50 text-sm"
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
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="pl-9 bg-background/50 border-border/30 focus:border-purple-500/50 text-sm"
              required
              minLength={6}
            />
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor()} transition-all duration-300`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
                <span
                  className={`text-[9px] ml-2 ${getStrengthColor()} font-medium`}
                >
                  {getStrengthText()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[8px]">
                <div
                  className={`flex items-center gap-1 ${passwordChecks.length ? "text-green-500" : "text-muted-foreground/50"}`}
                >
                  <CheckCircle className="h-2.5 w-2.5" />
                  <span>6+ chars</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${passwordChecks.uppercase ? "text-green-500" : "text-muted-foreground/50"}`}
                >
                  <CheckCircle className="h-2.5 w-2.5" />
                  <span>Uppercase</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${passwordChecks.lowercase ? "text-green-500" : "text-muted-foreground/50"}`}
                >
                  <CheckCircle className="h-2.5 w-2.5" />
                  <span>Lowercase</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${passwordChecks.number ? "text-green-500" : "text-muted-foreground/50"}`}
                >
                  <CheckCircle className="h-2.5 w-2.5" />
                  <span>Number</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="confirmPassword"
            className="text-xs font-medium text-muted-foreground"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9 bg-background/50 border-border/30 focus:border-purple-500/50 text-sm"
              required
            />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[9px] text-red-500 mt-1">
              Passwords do not match
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 transition-all duration-200 mt-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Creating account...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Create Account</span>
            </div>
          )}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/30"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-card/50 text-muted-foreground">
              Already have an account?
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="w-full text-center text-sm text-purple-500 hover:text-purple-400 transition-colors"
        >
          Sign in instead
        </button>
      </form>
    </div>
  );
};
