import { githubApi } from "@/lib/github-api"
import { getCachedItem, setCachedItem } from "@/lib/server-cache"
import { logger } from "@/lib/logger"
import { AccountRepository } from "@/repositories/account.repository"

export class SearchService {
  /**
   * Search GitHub issues resiliently with distributed caching.
   */
  static async searchIssues(params: {
    q: string
    sort?: string
    order?: string
    page: string
    perPage: string
    userId?: string
    clientToken?: string | null
  }) {
    const startTime = Date.now()
    const { q, sort, order, page, perPage, userId, clientToken } = params

    // Determine authorization token: user's PAT, user's OAuth token from DB, or server public token
    let githubToken = clientToken || process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN

    if (userId) {
      const dbToken = await AccountRepository.getGithubTokenByUserId(userId)
      if (dbToken) {
        githubToken = dbToken
      }
    }

    const tokenHash = githubToken ? githubToken.substring(githubToken.length - 8) : "public"
    const cacheKey = `issues:${q}:${sort || ""}:${order || ""}:${page}:${perPage}:${tokenHash}`

    const cachedData = await getCachedItem<unknown>(cacheKey)
    if (cachedData) {
      logger.info("GitHub issues search cache hit (Service)", {
        q,
        page,
        durationMs: Date.now() - startTime,
        cache: "HIT",
      })
      return { data: cachedData, cache: "HIT" }
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    }
    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`
    }

    // Call GitHub REST API via configured API client (inherits custom retry policies)
    const response = await githubApi.get("/search/issues", {
      params: {
        q,
        ...(sort ? { sort } : {}),
        ...(order ? { order } : {}),
        page,
        per_page: perPage,
      },
      headers,
    })

    await setCachedItem(cacheKey, response.data)

    logger.info("GitHub issues search cache miss - fetched new data (Service)", {
      q,
      page,
      durationMs: Date.now() - startTime,
      cache: "MISS",
    })

    return { data: response.data, cache: "MISS" }
  }

  /**
   * Search GitHub repositories resiliently with distributed caching.
   */
  static async searchRepositories(params: {
    q: string
    sort?: string
    order?: string
    page: string
    perPage: string
    userId?: string
    clientToken?: string | null
  }) {
    const startTime = Date.now()
    const { q, sort, order, page, perPage, userId, clientToken } = params

    let githubToken = clientToken || process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN

    if (userId) {
      const dbToken = await AccountRepository.getGithubTokenByUserId(userId)
      if (dbToken) {
        githubToken = dbToken
      }
    }

    const tokenHash = githubToken ? githubToken.substring(githubToken.length - 8) : "public"
    const cacheKey = `repos:${q}:${sort || ""}:${order || ""}:${page}:${perPage}:${tokenHash}`

    const cachedData = await getCachedItem<unknown>(cacheKey)
    if (cachedData) {
      logger.info("GitHub repos search cache hit (Service)", {
        q,
        page,
        durationMs: Date.now() - startTime,
        cache: "HIT",
      })
      return { data: cachedData, cache: "HIT" }
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    }
    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`
    }

    const response = await githubApi.get("/search/repositories", {
      params: {
        q,
        ...(sort ? { sort } : {}),
        ...(order ? { order } : {}),
        page,
        per_page: perPage,
      },
      headers,
    })

    await setCachedItem(cacheKey, response.data)

    logger.info("GitHub repos search cache miss - fetched new data (Service)", {
      q,
      page,
      durationMs: Date.now() - startTime,
      cache: "MISS",
    })

    return { data: response.data, cache: "MISS" }
  }
}
