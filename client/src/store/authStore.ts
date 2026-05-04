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
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyResetToken: (token: string) => Promise<boolean>;
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
            // Enhanced error messages based on status code
            if (response.status === 401) {
              throw new Error("Invalid email or password");
            } else if (response.status === 403) {
              throw new Error(
                "Please verify your email address before signing in",
              );
            } else if (response.status === 429) {
              throw new Error(
                "Too many login attempts. Please try again later",
              );
            }
            throw new Error(error.message || "Login failed");
          }

          const data = await response.json();

          // Validate response data
          if (!data.token || !data.user) {
            throw new Error("Invalid response from server");
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error("Login error:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Validate inputs before sending
          if (!username || username.length < 3) {
            throw new Error("Username must be at least 3 characters");
          }
          if (!email || !email.includes("@")) {
            throw new Error("Please enter a valid email address");
          }
          if (!password || password.length < 6) {
            throw new Error("Password must be at least 6 characters");
          }

          const response = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            // Enhanced error messages
            if (response.status === 409) {
              if (error.field === "email") {
                throw new Error(
                  "Email already registered. Please sign in instead",
                );
              } else if (error.field === "username") {
                throw new Error(
                  "Username already taken. Please choose another",
                );
              }
            }
            throw new Error(error.message || "Signup failed");
          }

          const data = await response.json();

          if (!data.token || !data.user) {
            throw new Error("Invalid response from server");
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
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
        localStorage.removeItem("auth-storage");
      },

      updateProfile: async (username: string, email: string) => {
        const { token } = get();
        if (!token) throw new Error("Not authenticated");

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
            if (response.status === 409) {
              throw new Error("Username or email already taken");
            }
            throw new Error(error.message || "Update failed");
          }

          const data = await response.json();
          set({
            user: data.user,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { token } = get();
        if (!token) throw new Error("Not authenticated");

        // Validate new password
        if (newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters");
        }
        if (currentPassword === newPassword) {
          throw new Error(
            "New password must be different from current password",
          );
        }

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
            if (response.status === 401) {
              throw new Error("Current password is incorrect");
            }
            throw new Error(error.message || "Password change failed");
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true });
        try {
          // Validate email
          if (!email || !email.includes("@")) {
            throw new Error("Please enter a valid email address");
          }

          const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) {
            const error = await response.json();
            // Don't reveal if email exists for security
            if (response.status === 404) {
              // Still return success to prevent email enumeration
              return;
            }
            throw new Error(error.message || "Failed to send reset email");
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          // Validate new password
          if (!newPassword || newPassword.length < 6) {
            throw new Error("Password must be at least 6 characters");
          }

          const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
          });

          if (!response.ok) {
            const error = await response.json();
            if (response.status === 401 || response.status === 400) {
              throw new Error("Reset link has expired or is invalid");
            }
            throw new Error(error.message || "Failed to reset password");
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      verifyResetToken: async (token: string) => {
        try {
          if (!token) return false;

          const response = await fetch(`${API_URL}/auth/verify-reset-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          if (!response.ok) return false;

          const data = await response.json();
          return data.valid === true;
        } catch (error) {
          console.error("Token verification error:", error);
          return false;
        }
      },

      checkAuth: async () => {
        const { token, isAuthenticated } = get();

        if (!token || !isAuthenticated) {
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
          } else {
            // Token expired or invalid
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
