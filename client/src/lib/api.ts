import axios from "axios";
import type { ThreatData } from "@/types/threat";
import { detectInputType } from "./inputDetector";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor (error handling)
api.interceptors.response.use(
  (res) => res,
  (error) => {
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

// ✅ Fixed analyzeInput function
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
