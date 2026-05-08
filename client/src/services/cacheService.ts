// src/services/cacheService.ts
import { getSavedAnalyses, getAnalysisById, checkSavedStatus } from "@/lib/api";
import type { ThreatData } from "@/types/threat";

interface CacheEntry {
  data: ThreatData;
  timestamp: number;
  source: "database" | "memory" | "api";
  expiresAt: number;
}

class ThreatCacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private readonly TTL = {
    DATABASE: 24 * 60 * 60 * 1000, // 24 hours for saved analyses
    MEMORY: 30 * 60 * 1000, // 30 minutes for temporary
    API: 5 * 60 * 1000, // 5 minutes for fresh API calls
  };

  constructor() {
    // Clean expired entries every 10 minutes
    setInterval(() => this.cleanExpired(), 10 * 60 * 1000);
  }

  private generateKey(input: string, inputType?: string): string {
    return `${inputType || "any"}:${input.toLowerCase().trim()}`;
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt < now) {
        this.memoryCache.delete(key);
        console.log(`[Cache] Cleaned expired entry: ${key}`);
      }
    }
  }

  async getAnalysis(
    input: string,
    inputType?: string,
    options?: { skipCache?: boolean; forceFresh?: boolean },
  ): Promise<{
    data: ThreatData | null;
    source: "database" | "memory" | "api" | "none";
  }> {
    const key = this.generateKey(input, inputType);
    const now = Date.now();

    // Skip cache if requested
    if (options?.skipCache) {
      return { data: null, source: "none" };
    }

    // Check memory cache first (fastest)
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && memoryEntry.expiresAt > now && !options?.forceFresh) {
      console.log(`[Cache] Memory hit for ${input}`);
      return { data: memoryEntry.data, source: "memory" };
    }

    // Check database for saved analyses
    try {
      console.log(`[Cache] Checking database for ${input}`);

      // First, try to find by exact input match in saved analyses
      const savedResponse = await getSavedAnalyses({ limit: 10 });

      if (savedResponse?.success && savedResponse.data?.saved) {
        const savedMatch = savedResponse.data.saved.find(
          (item: any) => item.input.toLowerCase() === input.toLowerCase(),
        );

        if (savedMatch) {
          // Fetch full analysis by ID
          const fullAnalysis = await getAnalysisById(savedMatch._id);

          if (fullAnalysis?.success && fullAnalysis.data) {
            const threatData = this.transformToThreatData(fullAnalysis.data);
            const cacheEntry: CacheEntry = {
              data: threatData,
              timestamp: now,
              source: "database",
              expiresAt: now + this.TTL.DATABASE,
            };
            this.memoryCache.set(key, cacheEntry);
            console.log(`[Cache] Database hit for ${input}`);
            return { data: threatData, source: "database" };
          }
        }
      }
    } catch (error) {
      console.warn(`[Cache] Database check failed for ${input}:`, error);
    }

    return { data: null, source: "none" };
  }

  async getAnalysisById(id: string): Promise<ThreatData | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(`id:${id}`);
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.data;
    }

    // Fetch from database
    try {
      const response = await getAnalysisById(id);
      if (response?.success && response.data) {
        const threatData = this.transformToThreatData(response.data);
        this.set(`id:${id}`, threatData, "database");
        return threatData;
      }
    } catch (error) {
      console.error(`[Cache] Failed to fetch analysis ${id}:`, error);
    }

    return null;
  }

  set(
    key: string,
    data: ThreatData,
    source: "database" | "memory" | "api",
  ): void {
    const ttl =
      source === "database"
        ? this.TTL.DATABASE
        : source === "memory"
          ? this.TTL.MEMORY
          : this.TTL.API;

    const cacheEntry: CacheEntry = {
      data,
      timestamp: Date.now(),
      source,
      expiresAt: Date.now() + ttl,
    };

    this.memoryCache.set(key, cacheEntry);

    // Also store by input for faster lookup
    const inputKey = this.generateKey(data.input, data.inputType);
    this.memoryCache.set(inputKey, cacheEntry);

    console.log(
      `[Cache] Stored ${key} (source: ${source}, TTL: ${ttl / 1000}s)`,
    );
  }

  private transformToThreatData(dbAnalysis: any): ThreatData {
    return {
      analysisId: dbAnalysis._id,
      input: dbAnalysis.input,
      inputType: dbAnalysis.inputType,
      type: dbAnalysis.inputType,
      riskScore: dbAnalysis.riskScore,
      riskLevel: dbAnalysis.riskLevel,
      timestamp: dbAnalysis.createdAt || dbAnalysis.savedAt,
      analysisDuration: dbAnalysis.analysisDuration,
      aiSummary: dbAnalysis.aiSummary,
      aiSummaryMeta: dbAnalysis.aiSummaryMeta,
      vt: dbAnalysis.serviceResponses?.vt,
      abuseipdb: dbAnalysis.serviceResponses?.abuseipdb,
      otx: dbAnalysis.serviceResponses?.otx,
      threatfox: dbAnalysis.serviceResponses?.threatfox,
      pulsedive: dbAnalysis.serviceResponses?.pulsedive,
      greynoise: dbAnalysis.serviceResponses?.greynoise,
      ipqualityscore: dbAnalysis.serviceResponses?.ipqualityscore,
      vpnapi: dbAnalysis.serviceResponses?.vpnapi,
      shodan: dbAnalysis.serviceResponses?.shodan,
      censys: dbAnalysis.serviceResponses?.censys,
      ipinfo: dbAnalysis.serviceResponses?.ipinfo,
      talos: dbAnalysis.serviceResponses?.talos,
      multirbl: dbAnalysis.serviceResponses?.multirbl,
      inquest: dbAnalysis.serviceResponses?.inquest,
      threatminer: dbAnalysis.serviceResponses?.threatminer,
      malwareurl: dbAnalysis.serviceResponses?.malwareurl,
      iocone: dbAnalysis.serviceResponses?.iocone,
      ipify: dbAnalysis.serviceResponses?.ipify,
      ipteoh: dbAnalysis.serviceResponses?.ipteoh,
      urlscan: dbAnalysis.serviceResponses?.urlscan,
      urlhaus: dbAnalysis.serviceResponses?.urlhaus,
      sucuri: dbAnalysis.serviceResponses?.sucuri,
    };
  }

  invalidate(input: string): void {
    const key = this.generateKey(input);
    this.memoryCache.delete(key);
    console.log(`[Cache] Invalidated ${input}`);
  }

  clear(): void {
    this.memoryCache.clear();
    console.log("[Cache] Cleared all cache entries");
  }

  getStats(): {
    size: number;
    entries: { key: string; source: string; expiresIn: number }[];
  } {
    const now = Date.now();
    const entries = Array.from(this.memoryCache.entries()).map(
      ([key, entry]) => ({
        key,
        source: entry.source,
        expiresIn: Math.max(0, Math.floor((entry.expiresAt - now) / 1000)),
      }),
    );

    return { size: this.memoryCache.size, entries };
  }
}

export const threatCache = new ThreatCacheService();
