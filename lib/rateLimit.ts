import { NextRequest } from "next/server";

const DAILY_LIMIT = 20;

interface RateLimitData {
  count: number;
  date: string; // YYYY-MM-DD
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Read the rate-limit cookie and return current usage.
 * Returns { allowed, remaining } where allowed is false when limit is hit.
 */
export function checkRateLimit(request: NextRequest): {
  allowed: boolean;
  remaining: number;
  limit: number;
} {
  const cookie = request.cookies.get("plant_id_usage");
  const today = getTodayStr();

  let data: RateLimitData = { count: 0, date: today };

  if (cookie?.value) {
    try {
      const parsed = JSON.parse(cookie.value) as RateLimitData;
      if (parsed.date === today) {
        data = parsed;
      }
      // If date is different, reset to 0 (new day)
    } catch {
      // Invalid cookie, start fresh
    }
  }

  const remaining = Math.max(0, DAILY_LIMIT - data.count);
  return {
    allowed: data.count < DAILY_LIMIT,
    remaining,
    limit: DAILY_LIMIT,
  };
}

/**
 * Return updated cookie value after consuming one scan.
 */
export function consumeScan(request: NextRequest): {
  cookieValue: string;
  remaining: number;
} {
  const cookie = request.cookies.get("plant_id_usage");
  const today = getTodayStr();

  let data: RateLimitData = { count: 0, date: today };

  if (cookie?.value) {
    try {
      const parsed = JSON.parse(cookie.value) as RateLimitData;
      if (parsed.date === today) {
        data = parsed;
      }
    } catch {
      // Invalid cookie, start fresh
    }
  }

  data.count += 1;
  data.date = today;

  const remaining = Math.max(0, DAILY_LIMIT - data.count);
  return {
    cookieValue: JSON.stringify(data),
    remaining,
  };
}
