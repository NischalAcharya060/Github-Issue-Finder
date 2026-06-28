import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://issue-finder.acharyanischal.com.np"

export default function robots(): MetadataRoute.Robots {
  const commonDisallows = ["/api/", "/my-issues", "/my-repos"]

  return {
    rules: [
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: commonDisallows,
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: commonDisallows,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: commonDisallows,
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: commonDisallows,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: commonDisallows,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: commonDisallows,
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: commonDisallows,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}

