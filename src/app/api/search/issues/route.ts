import { NextRequest, NextResponse } from "next/server"
import { SearchService } from "@/services/search.service"
import { auth } from "@/auth"
import axios from "axios"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get("q") || ""
  const sort = searchParams.get("sort") || undefined
  const order = searchParams.get("order") || undefined
  const page = searchParams.get("page") || "1"
  const perPage = searchParams.get("per_page") || "30"

  if (!q) {
    return NextResponse.json({ total_count: 0, items: [] })
  }

  const clientToken = request.headers.get("x-github-token")
  const session = await auth()
  const userId = session?.user?.id

  try {
    const { data, cache } = await SearchService.searchIssues({
      q,
      sort,
      order,
      page,
      perPage,
      userId,
      clientToken,
    })

    return NextResponse.json(data, {
      headers: {
        "X-Cache": cache,
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
    return NextResponse.json({ error: message }, { status })
  }
}


