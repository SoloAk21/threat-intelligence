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
  BadgeCheck,
  Settings,
  Fingerprint,
  Camera,
  Edit2,
  Star,
  Calendar,
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
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <Crown className="h-3 w-3 text-brand-secondary" />;
      case "premium":
        return <Star className="h-3 w-3 text-brand-primary" />;
      default:
        return <Shield className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "text-brand-secondary bg-brand-secondary/10";
      case "premium":
        return "text-brand-primary bg-brand-primary/10";
      default:
        return "text-muted-foreground bg-muted/20";
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "Administrator";
      case "premium":
        return "Premium Member";
      default:
        return "Free Member";
    }
  };

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
      setError("Password must be at least 6 characters long");
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
    ? new Date(user.createdAt).toLocaleDateString()
    : "Recently";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 p-0 hover:scale-105 transition-all duration-200 group rounded-full"
          >
            <div className="relative rounded-full">
              <Avatar className="h-9 w-9 transition-all duration-200 rounded-full">
                <AvatarFallback className="bg-brand-primary text-white text-xs font-bold rounded-full">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-72 border-border bg-surface-0 shadow-xl"
          align="end"
          forceMount
        >
          <DropdownMenuLabel className="font-normal p-0">
            <div className="p-4 bg-gradient-to-r from-brand-primary/5 to-transparent border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className="relative group/avatar"
                  onMouseEnter={() => setIsHoveringAvatar(true)}
                  onMouseLeave={() => setIsHoveringAvatar(false)}
                >
                  <Avatar className="h-14 w-14 rounded-full">
                    <AvatarFallback className="bg-brand-primary text-white text-base font-bold rounded-full">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 cursor-pointer">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground truncate">
                      {user.username}
                    </p>
                    <div
                      className={`text-[8px] px-1.5 py-0.5 ${getRoleColor(user.role)} rounded-sm flex items-center gap-0.5`}
                    >
                      {getRoleIcon(user.role)}
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                    <Mail className="h-2.5 w-2.5" />
                    {user.email}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 flex items-center gap-1 mt-1">
                    <Calendar className="h-2.5 w-2.5" />
                    Member since {memberSince}
                  </p>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem
            onSelect={() => setIsProfileOpen(true)}
            className="text-[11px] cursor-pointer py-2.5 px-4 hover:bg-brand-primary/10 transition-colors gap-3"
          >
            <User className="h-3.5 w-3.5 text-brand-primary" />
            <span>Profile Settings</span>
            <Edit2 className="h-3 w-3 text-muted-foreground/50 ml-auto" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setIsPasswordOpen(true)}
            className="text-[11px] cursor-pointer py-2.5 px-4 hover:bg-brand-primary/10 transition-colors gap-3"
          >
            <Key className="h-3.5 w-3.5 text-brand-primary" />
            <span>Change Password</span>
            <Lock className="h-3 w-3 text-muted-foreground/50 ml-auto" />
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem
            onSelect={logout}
            className="text-[11px] cursor-pointer py-2.5 px-4 text-risk-critical hover:bg-risk-critical/10 transition-colors gap-3"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Settings Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-md p-0 bg-surface-0 border-border shadow-xl overflow-hidden">
          <div className="p-5 border-b border-border bg-gradient-to-r from-brand-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 bg-brand-primary/15 border border-brand-primary/30 rounded-sm">
                <Settings className="h-4 w-4 text-brand-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Profile Settings
                </DialogTitle>
                <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
                  Update your profile information
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute right-4 top-4 p-1 hover:bg-brand-primary/10 transition-colors rounded-sm"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
            {/* Avatar Preview Section - Solid Teal Background */}
            <div className="flex items-center justify-center mb-2">
              <div className="relative group rounded-full">
                <Avatar className="h-20 w-20 rounded-full">
                  <AvatarFallback className="bg-brand-primary text-white text-2xl font-bold rounded-full">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="border-risk-critical/30 bg-risk-critical/10 p-3"
              >
                <AlertCircle className="h-3.5 w-3.5 text-risk-critical" />
                <AlertDescription className="text-[10px] text-risk-critical ml-2">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-risk-low/30 bg-risk-low/10 p-3">
                <CheckCircle className="h-3.5 w-3.5 text-risk-low" />
                <AlertDescription className="text-[10px] text-risk-low ml-2">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="profile-username"
                className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <User className="h-3 w-3 text-brand-primary" />
                Username
              </Label>
              <Input
                id="profile-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9 bg-surface-1 border border-border focus:border-brand-primary focus:outline-none focus:ring-0 focus:ring-offset-0 text-[11px]"
                required
                minLength={3}
                maxLength={30}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="profile-email"
                className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <Mail className="h-3 w-3 text-brand-primary" />
                Email Address
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 bg-surface-1 border border-border focus:border-brand-primary focus:outline-none focus:ring-0 focus:ring-offset-0 text-[11px]"
                required
              />
            </div>

            <div className="pt-3 border-t border-border/50 space-y-2">
              <div className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Fingerprint className="h-3 w-3" />
                  <span>Account ID</span>
                </div>
                <span className="font-mono text-brand-primary/80 text-[10px]">
                  {user.id?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Member Since</span>
                </div>
                <span className="text-foreground/80 text-[10px]">
                  {memberSince}
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Role</span>
                </div>
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 ${getRoleColor(user.role)} rounded-sm text-[9px]`}
                >
                  {getRoleIcon(user.role)}
                  {getRoleBadge(user.role)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary-dark transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Update Profile
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="max-w-md p-0 bg-surface-0 border-border shadow-xl overflow-hidden">
          <div className="p-5 border-b border-border bg-gradient-to-r from-brand-secondary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 bg-brand-secondary/15 border border-brand-secondary/30 rounded-sm">
                <Key className="h-4 w-4 text-brand-secondary" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Change Password
                </DialogTitle>
                <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
                  Update your password
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => setIsPasswordOpen(false)}
              className="absolute right-4 top-4 p-1 hover:bg-brand-secondary/10 transition-colors rounded-sm"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="p-5 space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="border-risk-critical/30 bg-risk-critical/10 p-3"
              >
                <AlertCircle className="h-3.5 w-3.5 text-risk-critical" />
                <AlertDescription className="text-[10px] text-risk-critical ml-2">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-risk-low/30 bg-risk-low/10 p-3">
                <CheckCircle className="h-3.5 w-3.5 text-risk-low" />
                <AlertDescription className="text-[10px] text-risk-low ml-2">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="current-password"
                className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <Lock className="h-3 w-3 text-brand-secondary" />
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-9 bg-surface-1 border border-border focus:border-brand-secondary focus:outline-none focus:ring-0 focus:ring-offset-0 text-[11px] pr-8"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-secondary transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="new-password"
                className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <Key className="h-3 w-3 text-brand-secondary" />
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-9 bg-surface-1 border border-border focus:border-brand-secondary focus:outline-none focus:ring-0 focus:ring-offset-0 text-[11px] pr-8"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-secondary transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[8px] text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirm-password"
                className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5"
              >
                <CheckCircle className="h-3 w-3 text-brand-secondary" />
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 bg-surface-1 border border-border focus:border-brand-secondary focus:outline-none focus:ring-0 focus:ring-offset-0 text-[11px] pr-8"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-secondary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {newPassword && (
              <div className="space-y-1">
                <div className="h-1 bg-surface-2">
                  <div
                    className={`h-full transition-all duration-300 ${
                      newPassword.length >= 6
                        ? newPassword.length >= 10
                          ? "w-full bg-risk-low"
                          : newPassword.length >= 8
                            ? "w-2/3 bg-risk-medium"
                            : "w-1/3 bg-risk-high"
                        : "w-0"
                    }`}
                  />
                </div>
                <p className="text-[8px] text-muted-foreground">
                  {newPassword.length >= 10
                    ? "Strong password"
                    : newPassword.length >= 8
                      ? "Good password"
                      : newPassword.length >= 6
                        ? "Weak password"
                        : "Enter a longer password"}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 bg-brand-secondary text-gray-900 text-[10px] font-bold uppercase tracking-wider hover:bg-brand-secondary-dark transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Key className="h-3.5 w-3.5" />
                  Change Password
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
