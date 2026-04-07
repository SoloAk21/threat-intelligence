import axios from "axios";
import type { AnalysisResponse } from "@/types/threat";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timed out. Please try again."));
    }
    if (error.response?.status === 429) {
      return Promise.reject(new Error("Rate limited. Please wait before trying again."));
    }
    if (!error.response) {
      return Promise.reject(new Error("Network error. Check your connection."));
    }
    return Promise.reject(error);
  }
);

export async function analyzeInput(input: string): Promise<AnalysisResponse> {
  const { data } = await api.post<AnalysisResponse>("/analyze", { input });
  return data;
}
