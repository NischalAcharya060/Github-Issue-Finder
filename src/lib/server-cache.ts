import { Redis } from "@upstash/redis"

type CacheEntry<T> = {
  data: T
  timestamp: number
}

interface GlobalCacheContainer {
  _serverCache?: Map<string, CacheEntry<unknown>>
}

const container = globalThis as unknown as GlobalCacheContainer
const globalCache = container._serverCache || new Map<string, CacheEntry<unknown>>()

if (typeof window === "undefined") {
  container._serverCache = globalCache
}

// Instantiate Upstash Redis if env vars are present
let redis: Redis | null = null
if (
  typeof window === "undefined" &&
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  } catch (error) {
    console.error("Failed to initialize Upstash Redis:", error)
  }
}

export async function getCachedItem<T>(key: string, maxAgeMs = 300_000): Promise<T | null> {
  if (redis) {
    try {
      const cached = await redis.get<T>(key)
      if (cached) return cached
    } catch (error) {
      console.warn("Redis read error, falling back to local memory cache:", error)
    }
  }

  const entry = globalCache.get(key)
  if (!entry) return null

  const age = Date.now() - entry.timestamp
  if (age > maxAgeMs) {
    globalCache.delete(key)
    return null
  }

  return entry.data as T
}

export async function setCachedItem<T>(key: string, data: T, maxAgeSeconds = 300): Promise<void> {
  if (redis) {
    try {
      await redis.set(key, data, { ex: maxAgeSeconds })
      return
    } catch (error) {
      console.warn("Redis write error, falling back to local memory cache:", error)
    }
  }

  globalCache.set(key, {
    data,
    timestamp: Date.now(),
  })

  // Periodically clean up expired items (max 1000 items)
  if (globalCache.size > 1000) {
    const now = Date.now()
    const maxAgeMs = maxAgeSeconds * 1000
    for (const [k, entry] of globalCache.entries()) {
      if (now - entry.timestamp > maxAgeMs) {
        globalCache.delete(k)
      }
    }
  }
}

