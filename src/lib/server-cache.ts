type CacheEntry<T> = {
  data: T
  timestamp: number
}

interface GlobalCacheContainer {
  _serverCache?: Map<string, CacheEntry<unknown>>
}

const DEFAULT_TTL = 300

function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return url && token ? { url, token } as const : null
}

const redisConfig = createRedisClient()

function createInMemoryCache() {
  const container = globalThis as unknown as GlobalCacheContainer
  const globalCache = container._serverCache || new Map<string, CacheEntry<unknown>>()
  if (typeof window === "undefined") {
    container._serverCache = globalCache
  }
  return globalCache
}

const memoryCache = createInMemoryCache()
const useRedis = redisConfig !== null

async function getRedis() {
  try {
    const { Redis } = await import("@upstash/redis")
    return new Redis({ url: redisConfig!.url, token: redisConfig!.token })
  } catch {
    return null
  }
}

export async function getCachedItem<T>(key: string, maxAgeMs = DEFAULT_TTL * 1000): Promise<T | null> {
  if (useRedis) {
    try {
      const redis = await getRedis()
      if (redis) {
        const result = await redis.get<{ data: T; timestamp: number }>(key)
        if (!result) return null
        const age = Date.now() - result.timestamp
        if (age > maxAgeMs) {
          await redis.del(key)
          return null
        }
        return result.data
      }
    } catch {
      // fall through to memory
    }
  }

  const entry = memoryCache.get(key)
  if (!entry) return null
  const age = Date.now() - entry.timestamp
  if (age > maxAgeMs) {
    memoryCache.delete(key)
    return null
  }
  return entry.data as T
}

export async function setCachedItem<T>(key: string, data: T): Promise<void> {
  if (useRedis) {
    try {
      const redis = await getRedis()
      if (redis) {
        await redis.set(key, { data, timestamp: Date.now() }, { ex: DEFAULT_TTL })
        return
      }
    } catch {
      // fall through to memory
    }
  }

  memoryCache.set(key, { data, timestamp: Date.now() })

  if (memoryCache.size > 1000) {
    const now = Date.now()
    for (const [k, entry] of memoryCache.entries()) {
      if (now - entry.timestamp > DEFAULT_TTL * 1000) {
        memoryCache.delete(k)
      }
    }
  }
}
