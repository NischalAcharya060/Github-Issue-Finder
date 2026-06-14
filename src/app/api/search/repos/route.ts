import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { getCachedItem, setCachedItem } from "@/lib/server-cache"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get("q") || ""
    const sort = searchParams.get("sort") || ""
    const order = searchParams.get("order") || ""
    const page = searchParams.get("page") || "1"
    const perPage = searchParams.get("per_page") || "30"

    if (!q) {
      return NextResponse.json({ total_count: 0, items: [] })
    }

    const userToken = request.headers.get("x-github-token")
    const serverToken = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN
    const activeToken = userToken || serverToken

    const tokenHash = activeToken ? activeToken.substring(activeToken.length - 8) : "public"
    const cacheKey = `repos:${q}:${sort}:${order}:${page}:${perPage}:${tokenHash}`

    const cachedData = getCachedItem<unknown>(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          "X-Cache": "HIT",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      })
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    }

    if (activeToken) {
      headers.Authorization = `Bearer ${activeToken}`
    }

    const response = await axios.get("https://api.github.com/search/repositories", {
      params: {
        q,
        ...(sort ? { sort } : {}),
        ...(order ? { order } : {}),
        page,
        per_page: perPage,
      },
      headers,
    })

    setCachedItem(cacheKey, response.data)

    return NextResponse.json(response.data, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    })
  } catch (error: unknown) {
    let status = 500
    let message = "Internal Server Error"
    if (axios.isAxiosError(error)) {
      status = error.response?.status || 500
      message = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      message = error.message
    }
    console.error("Error in API search repositories proxy:", message)
    return NextResponse.json({ error: message }, { status })
  }
}
