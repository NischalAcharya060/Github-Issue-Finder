import { getCachedItem, setCachedItem } from "@/lib/server-cache"

describe("server-cache (in-memory fallback)", () => {
  it("returns null for a missing key", async () => {
    expect(await getCachedItem("nonexistent")).toBeNull()
  })

  it("stores and retrieves a value", async () => {
    await setCachedItem("test-key", { foo: "bar" })
    const result = await getCachedItem<{ foo: string }>("test-key")
    expect(result).toEqual({ foo: "bar" })
  })

  it("returns null for expired items", async () => {
    await setCachedItem("expire-key", "data")
    const result = await getCachedItem("expire-key", -1)
    expect(result).toBeNull()
  })

  it("stores different keys independently", async () => {
    await setCachedItem("key-a", "value-a")
    await setCachedItem("key-b", "value-b")
    const a = await getCachedItem<string>("key-a")
    const b = await getCachedItem<string>("key-b")
    expect(a).toBe("value-a")
    expect(b).toBe("value-b")
  })

  it("overwrites existing key", async () => {
    await setCachedItem("overwrite", "first")
    await setCachedItem("overwrite", "second")
    const result = await getCachedItem<string>("overwrite")
    expect(result).toBe("second")
  })

  it("handles array data", async () => {
    const data = [1, 2, 3]
    await setCachedItem("array", data)
    const result = await getCachedItem<number[]>("array")
    expect(result).toEqual([1, 2, 3])
  })
})
