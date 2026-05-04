// src/utils/rateLimiter.ts
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  constructor(
    private identifier: string,
    private maxAttempts: number,
    private windowMs: number,
  ) {}

  canAttempt(key: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    const validAttempts = userAttempts.filter(
      (time) => now - time < this.windowMs,
    );

    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    return true;
  }

  recordAttempt(key: string): void {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    const validAttempts = userAttempts.filter(
      (time) => now - time < this.windowMs,
    );
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
  }

  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    const validAttempts = userAttempts.filter(
      (time) => now - time < this.windowMs,
    );
    return Math.max(0, this.maxAttempts - validAttempts.length);
  }

  getResetTime(key: string): Date | null {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    const validAttempts = userAttempts.filter(
      (time) => now - time < this.windowMs,
    );

    if (validAttempts.length < this.maxAttempts) {
      return null;
    }

    const oldestAttempt = Math.min(...validAttempts);
    return new Date(oldestAttempt + this.windowMs);
  }
}
