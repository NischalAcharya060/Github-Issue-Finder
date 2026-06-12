"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { IssueCard } from "./issue-card"
import type { GitHubIssue } from "@/lib/types"

interface IssueListProps {
  issues: GitHubIssue[] | undefined
  isLoading: boolean
  isError: boolean
  totalCount: number
}

export function IssueList({
  issues,
  isLoading,
  isError,
  totalCount,
}: IssueListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h3 className="mb-1 text-lg font-semibold">Something went wrong</h3>
        <p className="text-sm text-muted-foreground">
          Failed to fetch issues. Check your search query or try again later.
        </p>
      </div>
    )
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-4xl">🔍</div>
        <h3 className="mb-1 text-lg font-semibold">No issues found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {totalCount.toLocaleString()} issue{totalCount !== 1 ? "s" : ""}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  )
}
