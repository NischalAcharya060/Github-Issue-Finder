"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { IssueCard } from "./issue-card"
import type { GitHubIssue } from "@/lib/types"

interface IssueListProps {
  issues: GitHubIssue[] | undefined
  isLoading: boolean
  isError: boolean
  totalCount: number
  onIssueClick?: (id: number) => void
}

export function IssueList({
  issues,
  isLoading,
  isError,
  totalCount,
  onIssueClick,
}: IssueListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-4 h-4 w-2/3" />
            <div className="mb-3 flex gap-2">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-18 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-3 w-14" />
              </div>
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="ml-auto h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
          <span className="text-xl font-bold text-destructive">!</span>
        </div>
        <h3 className="mb-1.5 text-lg font-semibold">Something went wrong</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Failed to fetch issues. Check your search query or try again later.
        </p>
      </div>
    )
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
          <span className="text-xl font-medium text-muted-foreground">?</span>
        </div>
        <h3 className="mb-1.5 text-lg font-semibold">No issues found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {totalCount.toLocaleString()} issue
          {totalCount !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both cursor-pointer"
            style={{ animationDelay: `${issues.indexOf(issue) * 40}ms` }}
            onClick={() => onIssueClick?.(issue.id)}
          >
            <IssueCard issue={issue} />
          </div>
        ))}
      </div>
    </div>
  )
}
