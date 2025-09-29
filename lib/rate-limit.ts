import { type NextRequest, NextResponse } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(options: {
  windowMs: number
  maxRequests: number
  message?: string
}) {
  return async (request: NextRequest) => {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()

    // Clean up expired entries
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    })

    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs,
      }
      return null
    }

    if (store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs,
      }
      return null
    }

    store[key].count++

    if (store[key].count > options.maxRequests) {
      return NextResponse.json(
        { error: options.message || "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((store[key].resetTime - now) / 1000).toString(),
          },
        },
      )
    }

    return null
  }
}
