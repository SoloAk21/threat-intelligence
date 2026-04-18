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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full hover:scale-105 transition-transform"
          >
            <Avatar className="h-8 w-8 border-2 border-purple-500/30">
              <AvatarFallback className="bg-purple-500/10 text-purple-500 text-xs font-bold">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 border-border/30 bg-card/95 backdrop-blur-sm"
          align="end"
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-foreground">
                {user.username}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <p className="text-[9px] text-purple-500 mt-1 flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" />
                {user.role}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/30" />
          <DropdownMenuItem
            onSelect={() => setIsProfileOpen(true)}
            className="text-xs cursor-pointer"
          >
            <User className="mr-2 h-3 w-3" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setIsPasswordOpen(true)}
            className="text-xs cursor-pointer"
          >
            <Lock className="mr-2 h-3 w-3" />
            Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/30" />
          <DropdownMenuItem
            onSelect={logout}
            className="text-xs text-red-500 cursor-pointer"
          >
            <LogOut className="mr-2 h-3 w-3" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Settings Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-border/30">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Profile Settings
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-4">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-500/30 bg-red-500/10"
                >
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-500/30 bg-green-500/10">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <AlertDescription className="text-xs text-green-500">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="profile-username" className="text-xs">
                  Username
                </Label>
                <Input
                  id="profile-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 border-border/30 focus:border-purple-500/50 text-sm"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border/30 focus:border-purple-500/50 text-sm"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
              >
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-border/30">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update your password
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-500/30 bg-red-500/10"
                >
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-500/30 bg-green-500/10">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <AlertDescription className="text-xs text-green-500">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-xs">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-background/50 border-border/30 focus:border-purple-500/50 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background/50 border-border/30 focus:border-purple-500/50 text-sm"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background/50 border-border/30 focus:border-purple-500/50 text-sm"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
              >
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
