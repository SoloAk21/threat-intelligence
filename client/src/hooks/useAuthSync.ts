// src/hooks/useAuthSync.ts
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useAuthSync() {
  const { checkAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Sync auth state with localStorage for persistence
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem("threatscope-user", JSON.stringify(user));
    } else if (!isAuthenticated) {
      localStorage.removeItem("threatscope-user");
    }
  }, [isAuthenticated, user]);

  return { isAuthenticated, user };
}
