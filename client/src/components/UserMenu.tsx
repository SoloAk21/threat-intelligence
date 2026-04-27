import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import {
  User,
  Mail,
  Lock,
  LogOut,
  Shield,
  CheckCircle,
  AlertCircle,
  Key,
  Save,
  X,
  Eye,
  EyeOff,
  Crown,
  Settings,
  Fingerprint,
  Camera,
  Edit2,
  Star,
  Calendar,
  Award,
  Clock,
  BadgeCheck,
} from "lucide-react";

export const UserMenu: React.FC = () => {
  const { user, logout, updateProfile, changePassword } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleConfig = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return {
          icon: Crown,
          label: "Administrator",
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
        };
      case "premium":
        return {
          icon: Star,
          label: "Premium Member",
          color: "text-brand-primary",
          bg: "bg-brand-primary/10",
          border: "border-brand-primary/20",
        };
      default:
        return {
          icon: Shield,
          label: "Free Member",
          color: "text-muted-foreground",
          bg: "bg-muted/20",
          border: "border-border/30",
        };
    }
  };

  const roleConfig = getRoleConfig(user?.role);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await updateProfile(username, email);
      setSuccess("Profile updated successfully");
      setTimeout(() => {
        setIsProfileOpen(false);
        setSuccess("");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setIsPasswordOpen(false);
        setSuccess("");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const passwordStrength = () => {
    if (newPassword.length === 0) return { score: 0, label: "", color: "" };
    if (newPassword.length >= 12)
      return { score: 100, label: "Strong", color: "bg-emerald-500" };
    if (newPassword.length >= 8)
      return { score: 66, label: "Good", color: "bg-amber-500" };
    return { score: 33, label: "Weak", color: "bg-rose-500" };
  };

  const strength = passwordStrength();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative group focus:outline-none">
            <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Avatar className="h-8 w-8 lg:h-9 lg:w-9 transition-all duration-200 group-hover:scale-105 cursor-pointer border border-border/50 group-hover:border-brand-primary/50">
              <AvatarFallback className="bg-gradient-to-br text-foreground from-brand-primary to-brand-primary-dark  text-xs font-semibold">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-80 border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl rounded-xl p-1"
          align="end"
          sideOffset={8}
        >
          {/* User Header */}
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-14 w-14 rounded-full ring-2 ring-brand-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white text-base font-bold rounded-full">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.username}
                    </p>
                    <div
                      className={`text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${roleConfig.bg} ${roleConfig.border}`}
                    >
                      <roleConfig.icon
                        className={`h-2.5 w-2.5 ${roleConfig.color}`}
                      />
                      <span className={roleConfig.color}>
                        {roleConfig.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-1">
                    <Mail className="h-2.5 w-2.5" />
                    {user.email}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 flex items-center gap-1 mt-1">
                    <Calendar className="h-2.5 w-2.5" />
                    Joined {memberSince}
                  </p>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-border/30" />

          {/* Menu Items */}
          <DropdownMenuItem
            onSelect={() => setIsProfileOpen(true)}
            className="text-xs cursor-pointer py-2.5 px-3 rounded-lg hover:bg-brand-primary/10 transition-all duration-150 gap-3 focus:bg-brand-primary/10"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <User
                className="h-3.5 w-3.5 text-brand-primary"
                strokeWidth={1.5}
              />
            </div>
            <span className="flex-1 text-foreground/90">Profile Settings</span>
            <Edit2 className="h-3 w-3 text-muted-foreground/50" />
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setIsPasswordOpen(true)}
            className="text-xs cursor-pointer py-2.5 px-3 rounded-lg hover:bg-brand-primary/10 transition-all duration-150 gap-3 focus:bg-brand-primary/10"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-secondary/10 flex items-center justify-center">
              <Key
                className="h-3.5 w-3.5 text-brand-secondary"
                strokeWidth={1.5}
              />
            </div>
            <span className="flex-1 text-foreground/90">Change Password</span>
            <Lock className="h-3 w-3 text-muted-foreground/50" />
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border/30" />

          {/* Account Stats */}
          <div className="px-3 py-2">
            <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Account Stats
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Fingerprint className="h-2.5 w-2.5" />
                  <span>User ID</span>
                </div>
                <span className="font-mono text-brand-primary/80 text-[9px]">
                  {user.id?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Award className="h-2.5 w-2.5" />
                  <span>Role</span>
                </div>
                <span
                  className={`flex items-center gap-1 ${roleConfig.color} text-[9px]`}
                >
                  <roleConfig.icon className="h-2.5 w-2.5" />
                  {roleConfig.label}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-border/30" />

          <DropdownMenuItem
            onSelect={logout}
            className="text-xs cursor-pointer py-2.5 px-3 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all duration-150 gap-3 focus:bg-rose-500/10"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <LogOut className="h-3.5 w-3.5 text-rose-500" strokeWidth={1.5} />
            </div>
            <span className="flex-1">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ================================================================ */}
      {/* PROFILE SETTINGS DIALOG - Minimal & Clean */}
      {/* ================================================================ */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md p-0 bg-background border-border/60 shadow-2xl rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-border/30 bg-gradient-to-r from-brand-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-primary/15 border border-brand-primary/20">
                <Settings
                  className="h-4 w-4 text-brand-primary"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Profile Settings
                </DialogTitle>
                <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
                  Update your account information
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute right-4 top-5 p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-5 space-y-5">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <div className="relative group cursor-pointer">
                <Avatar className="h-20 w-20 rounded-full ring-4 ring-brand-primary/10">
                  <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white text-2xl font-bold rounded-full">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className="border-rose-500/30 bg-rose-500/10 rounded-lg p-3">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                    <AlertDescription className="text-[10px] text-rose-500 ml-2">
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className="border-emerald-500/30 bg-emerald-500/10 rounded-lg p-3">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    <AlertDescription className="text-[10px] text-emerald-500 ml-2">
                      {success}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Username Field */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <User
                  className="h-3 w-3 text-brand-primary"
                  strokeWidth={1.5}
                />
                Username
              </Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9 bg-muted/20 border-border/50 focus:border-brand-primary focus:ring-0 text-sm rounded-lg"
                required
                minLength={3}
                maxLength={30}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Mail
                  className="h-3 w-3 text-brand-primary"
                  strokeWidth={1.5}
                />
                Email Address
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 bg-muted/20 border-border/50 focus:border-brand-primary focus:ring-0 text-sm rounded-lg"
                required
              />
            </div>

            {/* Account Details */}
            <div className="pt-2 border-t border-border/30 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Fingerprint className="h-3 w-3" />
                  <span>Account ID</span>
                </div>
                <span className="font-mono text-brand-primary/80 text-[10px]">
                  {user.id?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Member Since</span>
                </div>
                <span className="text-foreground/80">{memberSince}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 bg-brand-primary text-white text-[10px] font-semibold uppercase tracking-wide rounded-lg hover:bg-brand-primary/90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* CHANGE PASSWORD DIALOG - Minimal & Clean */}
      {/* ================================================================ */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md p-0 bg-background border-border/60 shadow-2xl rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-border/30 bg-gradient-to-r from-brand-secondary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-secondary/15 border border-brand-secondary/20">
                <Key
                  className="h-4 w-4 text-brand-secondary"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Change Password
                </DialogTitle>
                <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
                  Update your security credentials
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => setIsPasswordOpen(false)}
              className="absolute right-4 top-5 p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="p-5 space-y-5">
            {/* Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className="border-rose-500/30 bg-rose-500/10 rounded-lg p-3">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                    <AlertDescription className="text-[10px] text-rose-500 ml-2">
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className="border-emerald-500/30 bg-emerald-500/10 rounded-lg p-3">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    <AlertDescription className="text-[10px] text-emerald-500 ml-2">
                      {success}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current Password */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Lock
                  className="h-3 w-3 text-brand-secondary"
                  strokeWidth={1.5}
                />
                Current Password
              </Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-9 bg-muted/20 border-border/50 focus:border-brand-secondary focus:ring-0 text-sm rounded-lg pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-secondary transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Key
                  className="h-3 w-3 text-brand-secondary"
                  strokeWidth={1.5}
                />
                New Password
              </Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-9 bg-muted/20 border-border/50 focus:border-brand-secondary focus:ring-0 text-sm rounded-lg pr-9"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-secondary transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <BadgeCheck
                  className="h-3 w-3 text-brand-secondary"
                  strokeWidth={1.5}
                />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 bg-muted/20 border-border/50 focus:border-brand-secondary focus:ring-0 text-sm rounded-lg pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-secondary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-1"
              >
                <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${strength.score}%` }}
                    className={`h-full ${strength.color} transition-all duration-300`}
                  />
                </div>
                <div className="flex justify-between text-[8px]">
                  <span className="text-muted-foreground">
                    Password strength:
                  </span>
                  <span
                    className={
                      strength.color === "bg-rose-500"
                        ? "text-rose-500"
                        : strength.color === "bg-amber-500"
                          ? "text-amber-500"
                          : "text-emerald-500"
                    }
                  >
                    {strength.label}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 bg-brand-secondary text-black text-[10px] font-semibold uppercase tracking-wide rounded-lg hover:bg-brand-secondary/90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Key className="h-3.5 w-3.5" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserMenu;
