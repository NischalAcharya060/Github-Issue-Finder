import { createProxyHandler } from "@/lib/api-proxy"

export const GET = createProxyHandler({
  endpoint: "search/issues",
  cachePrefix: "issues",
  logLabel: "issues",
})
