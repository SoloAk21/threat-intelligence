// src/services/apiKeyManager.js
const fs = require("fs").promises;
const path = require("path");

class APIKeyManager {
  constructor() {
    this.keys = {};
    this.currentIndex = {};
    this.failedKeys = {};
    this.lastUsed = {};
    this.requestCounts = {};
    this.loadKeys();

    // Reset failed keys every hour
    setInterval(() => this.resetFailedKeys(), 60 * 60 * 1000);
  }

  async loadKeys() {
    // Define all services that support multiple API keys
    const services = {
      VT_API: process.env.VT_API_KEYS || process.env.VT_API_KEY,
      ABUSEIPDB_API:
        process.env.ABUSEIPDB_API_KEYS || process.env.ABUSEIPDB_API_KEY,
      OTX_API: process.env.OTX_API_KEYS || process.env.OTX_API_KEY,
      THREATFOX_AUTH:
        process.env.THREATFOX_AUTH_KEYS || process.env.THREATFOX_AUTH_KEY,
      PULSEDIVE_API:
        process.env.PULSEDIVE_API_KEYS || process.env.PULSEDIVE_API_KEY,
      GREYNOISE_API:
        process.env.GREYNOISE_API_KEYS || process.env.GREYNOISE_API_KEY,
      IPQUALITYSCORE_API:
        process.env.IPQUALITYSCORE_API_KEYS ||
        process.env.IPQUALITYSCORE_API_KEY,
      VPNAPI: process.env.VPNAPI_KEYS || process.env.VPNAPI_KEY,
      SHODAN_API: process.env.SHODAN_API_KEYS || process.env.SHODAN_API_KEY,
      CENSYS_API: process.env.CENSYS_API_KEYS || process.env.CENSYS_API_KEY,
      IPINFO: process.env.IPINFO_KEYS || process.env.IPINFO_KEY,
      IPIFY_API: process.env.IPIFY_API_KEYS || process.env.IPIFY_API_KEY,
      URLSCAN_API: process.env.URLSCAN_API_KEYS || process.env.URLSCAN_API_KEY,
      URLHAUS_API: process.env.URLHAUS_API_KEYS || process.env.URLHAUS_API_KEY,
      SUCURI_API: process.env.SUCURI_API_KEYS || process.env.SUCURI_API_KEY,
      GEMINI_API: process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY,
    };

    for (const [service, keysValue] of Object.entries(services)) {
      if (keysValue) {
        // Split comma-separated keys and trim whitespace
        let keysArray = keysValue
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k);

        // If only one key and no commas, keep as single-item array
        if (keysArray.length === 0 && keysValue) {
          keysArray = [keysValue.trim()];
        }

        this.keys[service] = keysArray;
        this.currentIndex[service] = 0;
        this.failedKeys[service] = new Set();
        this.lastUsed[service] = {};
        this.requestCounts[service] = {};

        // Initialize request counts for each key
        keysArray.forEach((key) => {
          this.requestCounts[service][key] = 0;
          this.lastUsed[service][key] = 0;
        });

        console.log(
          `[APIKeyManager] Loaded ${keysArray.length} key(s) for ${service}`,
        );
      } else {
        this.keys[service] = [];
        console.warn(`[APIKeyManager] No API keys configured for ${service}`);
      }
    }
  }

  getKey(serviceName) {
    const keys = this.keys[serviceName];
    if (!keys || keys.length === 0) {
      return null;
    }

    // Get available keys (not failed)
    const availableKeys = keys.filter(
      (key) => !this.failedKeys[serviceName]?.has(key),
    );

    if (availableKeys.length === 0) {
      console.error(
        `[APIKeyManager] All keys failed for ${serviceName}, resetting failed keys`,
      );
      this.failedKeys[serviceName] = new Set();
      return keys[0];
    }

    // Round-robin with request distribution
    let attempts = 0;
    let key = null;

    while (attempts < availableKeys.length) {
      const index = this.currentIndex[serviceName] % availableKeys.length;
      key = availableKeys[index];

      // Update current index for next request
      this.currentIndex[serviceName] =
        (this.currentIndex[serviceName] + 1) % availableKeys.length;

      // Rate limiting: check if key has been used too much in last second
      const now = Date.now();
      const lastUsedTime = this.lastUsed[serviceName][key] || 0;
      const requestCount = this.requestCounts[serviceName][key] || 0;

      // If key was used in last 100ms and has >10 requests, try next key
      if (now - lastUsedTime < 100 && requestCount > 10) {
        attempts++;
        continue;
      }

      // Update usage stats
      this.lastUsed[serviceName][key] = now;
      this.requestCounts[serviceName][key] =
        (this.requestCounts[serviceName][key] || 0) + 1;

      // Reset request counts every minute
      if (now - (this.lastReset || 0) > 60000) {
        this.resetRequestCounts();
        this.lastReset = now;
      }

      break;
    }

    return key;
  }

  async rotateKeyOnError(serviceName, failedKey, errorType = "rate_limit") {
    if (!this.failedKeys[serviceName]) {
      this.failedKeys[serviceName] = new Set();
    }

    this.failedKeys[serviceName].add(failedKey);

    // Calculate cooldown based on error type
    let cooldownTime = 60000; // Default 1 minute

    switch (errorType) {
      case "rate_limit":
        cooldownTime = 120000; // 2 minutes for rate limits
        break;
      case "auth":
        cooldownTime = 3600000; // 1 hour for auth errors
        break;
      case "timeout":
        cooldownTime = 30000; // 30 seconds for timeouts
        break;
      default:
        cooldownTime = 60000;
    }

    console.log(
      `[APIKeyManager] Marked key for ${serviceName} as failed (${errorType}), cooldown: ${cooldownTime}ms`,
    );

    // Schedule key recovery
    setTimeout(() => {
      this.failedKeys[serviceName].delete(failedKey);
      console.log(`[APIKeyManager] Recovered key for ${serviceName}`);
    }, cooldownTime);

    // Log key status
    const remainingKeys = this.keys[serviceName].filter(
      (k) => !this.failedKeys[serviceName].has(k),
    );
    console.log(
      `[APIKeyManager] ${serviceName}: ${remainingKeys.length}/${this.keys[serviceName].length} keys available`,
    );
  }

  resetFailedKeys() {
    for (const service in this.failedKeys) {
      const failedCount = this.failedKeys[service].size;
      if (failedCount > 0) {
        this.failedKeys[service].clear();
        console.log(
          `[APIKeyManager] Reset ${failedCount} failed keys for ${service}`,
        );
      }
    }
  }

  resetRequestCounts() {
    for (const service in this.requestCounts) {
      for (const key in this.requestCounts[service]) {
        this.requestCounts[service][key] = 0;
      }
    }
  }

  getKeyStatus(serviceName) {
    const keys = this.keys[serviceName] || [];
    const failedKeys = this.failedKeys[serviceName] || new Set();
    const currentIndex = this.currentIndex[serviceName] || 0;

    return {
      total: keys.length,
      available: keys.filter((k) => !failedKeys.has(k)).length,
      failed: failedKeys.size,
      currentIndex: currentIndex,
      keys: keys.map((key, index) => ({
        index: index,
        preview: key.substring(0, Math.min(12, key.length)) + "...",
        isCurrent: index === currentIndex,
        isFailed: failedKeys.has(key),
        requestCount: this.requestCounts[serviceName]?.[key] || 0,
        lastUsed: this.lastUsed[serviceName]?.[key] || 0,
      })),
    };
  }

  getTotalKeys(serviceName) {
    return this.keys[serviceName]?.length || 0;
  }

  async addKey(serviceName, newKey) {
    if (!this.keys[serviceName]) {
      this.keys[serviceName] = [];
    }

    this.keys[serviceName].push(newKey);
    this.requestCounts[serviceName][newKey] = 0;
    this.lastUsed[serviceName][newKey] = 0;

    // Update .env file
    const envPath = path.join(process.cwd(), ".env");
    let envContent = await fs.readFile(envPath, "utf-8");

    const keyPattern = new RegExp(`${serviceName}_KEYS=.*`, "g");
    const newKeys = this.keys[serviceName].join(",");
    const newLine = `${serviceName}_KEYS=${newKeys}`;

    if (keyPattern.test(envContent)) {
      envContent = envContent.replace(keyPattern, newLine);
    } else {
      envContent += `\n${newLine}`;
    }

    await fs.writeFile(envPath, envContent);
    console.log(`[APIKeyManager] Added new key for ${serviceName}`);

    return true;
  }

  rotateKey(serviceName) {
    if (!this.keys[serviceName] || this.keys[serviceName].length === 0) {
      return false;
    }

    this.currentIndex[serviceName] =
      (this.currentIndex[serviceName] + 1) % this.keys[serviceName].length;
    console.log(
      `[APIKeyManager] Manually rotated key for ${serviceName} to index ${this.currentIndex[serviceName]}`,
    );

    return true;
  }

  // Get health summary for all services
  getHealthSummary() {
    const summary = {};
    for (const service in this.keys) {
      const status = this.getKeyStatus(service);
      summary[service] = {
        health:
          status.available > 0
            ? "healthy"
            : status.total > 0
              ? "degraded"
              : "unavailable",
        available: status.available,
        total: status.total,
        failed: status.failed,
      };
    }
    return summary;
  }
}

module.exports = new APIKeyManager();
