// Distributed rate limiter using Upstash Redis via @vercel/kv.
// Falls back to in-memory for local development when KV is not configured.

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Unique identifier for the rate limit (e.g. IP + action) */
  key: string;
}

// ── In-memory fallback (local dev only) ──────────────────────────────────────

type RateLimitRecord = { count: number; resetTime: number };
const localStore = new Map<string, RateLimitRecord>();

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of localStore.entries()) {
    if (record.resetTime < now) localStore.delete(key);
  }
}, 60_000);

function localRateLimit(options: RateLimitOptions) {
  const { key, limit, windowMs } = options;
  const now = Date.now();
  let record = localStore.get(key);
  if (!record || record.resetTime < now) {
    record = { count: 0, resetTime: now + windowMs };
    localStore.set(key, record);
  }
  record.count += 1;
  return {
    success: record.count <= limit,
    remaining: Math.max(0, limit - record.count),
    resetTime: record.resetTime,
  };
}

// ── Distributed rate limit via Redis ─────────────────────────────────────────

async function redisRateLimit(options: RateLimitOptions) {
  const { kv } = await import("@vercel/kv");
  const { key, limit, windowMs } = options;
  const windowSec = Math.ceil(windowMs / 1000);
  const now = Date.now();

  // INCR atomically increments (creates key at 0 first if missing)
  const count = await kv.incr(key);
  if (count === 1) {
    // First request in this window — set expiry
    await kv.expire(key, windowSec);
  }

  const ttl = await kv.ttl(key);
  const resetTime = ttl > 0 ? now + ttl * 1000 : now + windowMs;

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    resetTime,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function checkRateLimit(options: RateLimitOptions): Promise<{
  success: boolean;
  remaining: number;
  resetTime: number;
}> {
  // Use Redis in production; fall back to in-memory locally
  if (process.env.KV_REST_API_URL) {
    try {
      return await redisRateLimit(options);
    } catch (err) {
      console.error("[RateLimit] Redis error, falling back to local:", err);
      return localRateLimit(options);
    }
  }
  return localRateLimit(options);
}

export function getClientIP(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown-ip"
  );
}
