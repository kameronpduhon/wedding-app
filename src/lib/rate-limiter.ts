import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number   // sliding window duration in milliseconds
  maxRequests: number // max requests allowed within the window
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number // seconds until oldest entry expires
}

// IP -> array of request timestamps
const requestMap = new Map<string, number[]>()

// Auto-cleanup stale entries every 10 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 10 * 60 * 1000

let cleanupTimer: ReturnType<typeof setInterval> | null = null

function startCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [ip, timestamps] of requestMap) {
      // Remove entries older than 1 hour (max window we use)
      const fresh = timestamps.filter((t) => now - t < 60 * 60 * 1000)
      if (fresh.length === 0) {
        requestMap.delete(ip)
      } else {
        requestMap.set(ip, fresh)
      }
    }
  }, CLEANUP_INTERVAL)
  // Allow process to exit without waiting for this timer
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): RateLimitResult {
  startCleanup()

  const now = Date.now()
  const windowStart = now - config.windowMs

  // Get existing timestamps and filter to current window
  const timestamps = (requestMap.get(ip) || []).filter((t) => t > windowStart)

  if (timestamps.length >= config.maxRequests) {
    const oldest = timestamps[0]
    const resetIn = Math.ceil((oldest + config.windowMs - now) / 1000)
    return { allowed: false, remaining: 0, resetIn }
  }

  // Record this request
  timestamps.push(now)
  requestMap.set(ip, timestamps)

  return {
    allowed: true,
    remaining: config.maxRequests - timestamps.length,
    resetIn: Math.ceil(config.windowMs / 1000),
  }
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}
