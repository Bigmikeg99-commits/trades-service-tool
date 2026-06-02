// Simple in-memory rate limiter for lightweight local use.
// Not suitable for multi-instance production without Redis/Upstash.

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitRecord>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetTime < now) {
      store.delete(key);
    }
  }
}, 60_000); // Clean every minute

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Unique identifier for the rate limit (e.g. IP + action) */
  key: string;
}

export function checkRateLimit(options: RateLimitOptions): {
  success: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const { key, limit, windowMs } = options;

  let record = store.get(key);

  if (!record || record.resetTime < now) {
    record = {
      count: 0,
      resetTime: now + windowMs,
    };
    store.set(key, record);
  }

  record.count += 1;

  const remaining = Math.max(0, limit - record.count);
  const success = record.count <= limit;

  return {
    success,
    remaining,
    resetTime: record.resetTime,
  };
}

export function getClientIP(headers: Headers): string {
  // Common headers in different hosting environments
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown-ip"
  );
}