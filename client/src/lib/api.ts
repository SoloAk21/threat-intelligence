// src/lib/api.ts
import axios from "axios";
import type { ThreatData } from "@/types/threat";
import { detectInputType } from "./inputDetector";

// Get token from localStorage
const getToken = () => {
  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ✅ Request interceptor to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found for request:", config.url);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error("Authentication error - redirecting to login");
      localStorage.removeItem("auth-storage");
      window.location.href = "/auth";
      return Promise.reject(new Error("Session expired. Please login again."));
    }

    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timed out. Please try again."));
    }
    if (error.response?.status === 429) {
      return Promise.reject(
        new Error("Rate limited. Please wait before trying again."),
      );
    }
    if (!error.response) {
      return Promise.reject(new Error("Network error. Check your connection."));
    }
    return Promise.reject(error);
  },
);

export async function analyzeInput(
  input: string,
): Promise<{ success: boolean; data: ThreatData }> {
  const type = detectInputType(input);

  const response = await api.post("/analyze", {
    input,
    type,
  });

  return response.data;
}

// Export the api instance for other services
export { api };
