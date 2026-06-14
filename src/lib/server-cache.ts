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

export function getCachedItem<T>(key: string, maxAgeMs = 300_000): T | null {
  const entry = globalCache.get(key)
  if (!entry) return null

  const age = Date.now() - entry.timestamp
  if (age > maxAgeMs) {
    globalCache.delete(key)
    return null
  }

  return entry.data as T
}

export function setCachedItem<T>(key: string, data: T): void {
  globalCache.set(key, {
    data,
    timestamp: Date.now(),
  })

  // Periodically clean up expired items (max 1000 items)
  if (globalCache.size > 1000) {
    const now = Date.now()
    for (const [k, entry] of globalCache.entries()) {
      if (now - entry.timestamp > 300_000) {
        globalCache.delete(k)
      }
    }
  }
}
