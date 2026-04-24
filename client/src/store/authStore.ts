// src/store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (username: string, email: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Login failed");
          }

          const data = await response.json();
          console.log("Login response:", {
            token: data.token,
            user: data.user,
          }); // Debug log

          // Save token and user
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Signup failed");
          }

          const data = await response.json();
          console.log("Signup response:", {
            token: data.token,
            user: data.user,
          }); // Debug log

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Signup error:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        // Clear all storage
        localStorage.removeItem("auth-storage");
      },

      updateProfile: async (username: string, email: string) => {
        const { token } = get();
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username, email }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Update failed");
          }

          const data = await response.json();
          set({
            user: data.user,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { token } = get();
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/change-password`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Password change failed");
          }

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      checkAuth: async () => {
        const { token, isAuthenticated } = get();
        console.log("Checking auth:", { hasToken: !!token, isAuthenticated }); // Debug log

        if (!token || !isAuthenticated) {
          console.log("No token or not authenticated");
          return;
        }

        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            set({ user: data.user, isAuthenticated: true });
            console.log("Auth check successful:", data.user);
          } else {
            console.log("Auth check failed, clearing state");
            set({ user: null, token: null, isAuthenticated: false });
            localStorage.removeItem("auth-storage");
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem("auth-storage");
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
