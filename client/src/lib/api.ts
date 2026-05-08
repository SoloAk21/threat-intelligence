import axios from "axios";
import { getToken } from "@/store/authStore"; // Now this works!
import type { ThreatData } from "@/types/threat";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AnalyzeResponse {
  success: boolean;
  temporary: boolean;
  tempId: string;
  message: string;
  data: ThreatData;
}

export const analyzeInput = async (input: string): Promise<AnalyzeResponse> => {
  const response = await api.post("/analyze", { input });
  return response.data;
};

export const saveAnalysis = async (
  tempId: string,
  notes?: string,
  tags?: string[],
): Promise<{ success: boolean; data: any; message: string }> => {
  const response = await api.post("/save", { tempId, notes, tags });
  return response.data;
};

export const getSavedAnalyses = async (params?: {
  limit?: number;
  offset?: number;
  riskLevel?: string;
  inputType?: string;
  starred?: boolean;
}) => {
  const response = await api.get("/saved", { params });
  return response.data;
};

export const deleteSavedAnalysis = async (id: string) => {
  const response = await api.delete(`/saved/${id}`);
  return response.data;
};

export const toggleStarred = async (id: string) => {
  const response = await api.patch(`/saved/${id}/star`);
  return response.data;
};

export const updateSavedAnalysis = async (
  id: string,
  notes: string,
  tags: string[],
) => {
  const response = await api.patch(`/saved/${id}`, { notes, tags });
  return response.data;
};

export const checkSavedStatus = async (analysisId: string) => {
  const response = await api.get(`/saved/check/${analysisId}`);
  return response.data;
};

export const getAnalysisHistory = async (params?: {
  limit?: number;
  offset?: number;
  riskLevel?: string;
  inputType?: string;
}) => {
  const response = await api.get("/history", { params });
  return response.data;
};

export const getAnalysisById = async (id: string) => {
  const response = await api.get(`/analysis/${id}`);
  return response.data;
};

export const deleteAnalysis = async (id: string, force?: boolean) => {
  const response = await api.delete(`/analysis/${id}`, { params: { force } });
  return response.data;
};

export const getStatistics = async () => {
  const response = await api.get("/statistics");
  return response.data;
};

export default api;
