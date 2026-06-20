"use client"

import { useState, useCallback } from "react"
import { TrendingUp, Flame, Star, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IssueList } from "@/components/issues/issue-list"
import { Pagination } from "@/components/shared/pagination"
import { useIgnoredRepos } from "@/hooks/use-ignored-repos"
import { searchIssues } from "@/lib/github-api"
import { useQuery } from "@tanstack/react-query"
import type { SearchResponse } from "@/lib/types"

type TrendingPeriod = "today" | "week" | "month"

const periodConfig: Record<TrendingPeriod, { label: string; description: string }> = {
  today: { label: "Today", description: "Issues created or updated in the last 24 hours" },
  week: { label: "This Week", description: "Hot issues from the past 7 days" },
  month: { label: "This Month", description: "Trending issues from the past 30 days" },
}

const TODAY = new Date().toISOString().split("T")[0]

function getDateRange(period: TrendingPeriod): string {
  const now = new Date()
  switch (period) {
    case "today":
      now.setDate(now.getDate() - 1)
      return `${now.toISOString().split("T")[0]}..${TODAY}`
    case "week":
      now.setDate(now.getDate() - 7)
      return `${now.toISOString().split("T")[0]}..${TODAY}`
    case "month":
      now.setDate(now.getDate() - 30)
      return `${now.toISOString().split("T")[0]}..${TODAY}`
  }
}

function buildTrendingQuery(period: TrendingPeriod): string {
  const dateRange = getDateRange(period)
  const parts = [
    "is:issue",
    "state:open",
    `created:${dateRange}`,
    "stars:>=50",
    "comments:>=1",
  ]
  return parts.join(" ")
}

interface TrendingFeedProps {
  onIssueClick: (id: number) => void
}

export function TrendingFeed({ onIssueClick }: TrendingFeedProps) {
  const [period, setPeriod] = useState<TrendingPeriod>("week")
  const [page, setPage] = useState(1)
  const { isIgnored } = useIgnoredRepos()

  const query = buildTrendingQuery(period)

  const { data, isLoading, isError, refetch, isFetching } = useQuery<SearchResponse>({
    queryKey: ["trending", period, page],
    queryFn: () =>
      searchIssues({
        q: query,
        sort: "reactions-+1",
        order: "desc",
        page,
        per_page: 30,
      }),
    staleTime: 120_000,
  })

  const getRepoFromUrl = useCallback(
    (url: string) => url.replace("https://api.github.com/repos/", ""),
    []
  )

  const filteredIssues = (data?.items ?? []).filter(
    (issue) => !isIgnored(getRepoFromUrl(issue.repository_url))
  )

  const totalPages = data
    ? Math.min(Math.ceil(data.total_count / 30), 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/15 bg-gradient-to-r from-orange-500/8 to-rose-500/5 px-5 py-4 shadow-sm shadow-orange-500/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-base font-bold tracking-tight">
              <TrendingUp className="size-4 text-orange-500" />
              Trending Issues
            </h2>
            <p className="text-xs text-muted-foreground leading-normal max-w-xl">
              {periodConfig[period].description} — sorted by most reactions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1 text-muted-foreground cursor-pointer"
            >
              <RefreshCw className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Period selector */}
        <div className="mt-3.5 flex items-center gap-1.5 border-t border-orange-500/10 pt-3">
          {(Object.keys(periodConfig) as TrendingPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setPeriod(p); setPage(1) }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                period === p
                  ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/25 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {periodConfig[p].label}
            </button>
          ))}
        </div>

        {/* Stats row */}
        {data && (
          <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-orange-500/10 pt-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Flame className="size-3.5 text-orange-500" />
              <span className="font-semibold text-foreground">{data.total_count.toLocaleString()}</span> issues found
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="size-3.5 text-amber-500" />
              Sorted by reactions
            </span>
          </div>
        )}
      </div>

      {/* Issue listing */}
      <IssueList
        issues={filteredIssues}
        isLoading={isLoading}
        isError={isError}
        totalCount={data?.total_count ?? 0}
        onIssueClick={onIssueClick}
      />

      {data && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={data.total_count}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ")
}
