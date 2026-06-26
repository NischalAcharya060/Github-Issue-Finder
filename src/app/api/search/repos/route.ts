import { createProxyHandler } from "@/lib/api-proxy"

export const GET = createProxyHandler({
  endpoint: "search/repositories",
  cachePrefix: "repos",
  logLabel: "repositories",
})
