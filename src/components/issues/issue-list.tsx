"use client"

import { AlertTriangle, SearchX } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { StatePanel } from "@/components/shared/state-panel"
import { Stagger, StaggerItem } from "@/components/motion/motion-primitives"
import { IssueCard } from "./issue-card"
import type { GitHubIssue } from "@/lib/types"

interface IssueListProps {
  issues: GitHubIssue[] | undefined
  isLoading: boolean
  isError: boolean
  totalCount: number
  onIssueClick?: (id: number) => void
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-6 w-28 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-3 border-t border-border/50 pt-3">
        <Skeleton className="size-4.5 rounded-full" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="ml-auto h-3 w-16" />
      </div>
    </div>
  )
}

export function IssueList({
  issues,
  isLoading,
  isError,
  onIssueClick,
}: IssueListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <StatePanel
        icon={AlertTriangle}
        tone="error"
        title="Something went wrong"
        description="Failed to fetch issues. Check your search query or try again later."
      />
    )
  }

  if (!issues || issues.length === 0) {
    return (
      <StatePanel
        icon={SearchX}
        title="No issues found"
        description="Try adjusting your search keywords or loosening the filters."
      />
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const items = Array.from(container.querySelectorAll("[data-list-item]")) as HTMLElement[]
    if (items.length === 0) return

    const activeIndex = items.indexOf(document.activeElement as HTMLElement)
    if (activeIndex === -1) return

    let cols = 1
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) cols = 3 // lg:grid-cols-3
      else if (window.innerWidth >= 640) cols = 2 // sm:grid-cols-2
    }

    let nextIndex = -1
    if (e.key === "ArrowRight") {
      nextIndex = activeIndex + 1
    } else if (e.key === "ArrowLeft") {
      nextIndex = activeIndex - 1
    } else if (e.key === "ArrowDown") {
      nextIndex = activeIndex + cols
    } else if (e.key === "ArrowUp") {
      nextIndex = activeIndex - cols
    } else {
      return
    }

    if (nextIndex >= 0 && nextIndex < items.length) {
      e.preventDefault()
      items[nextIndex].focus()
    }
  }

  return (
    <Stagger
      stagger={0.04}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 outline-none"
      onKeyDown={handleKeyDown}
    >
      {issues.map((issue) => (
        <StaggerItem
          key={issue.id}
          className="cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-shadow"
          onClick={() => onIssueClick?.(issue.id)}
          tabIndex={0}
          data-list-item
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onIssueClick?.(issue.id)
            }
          }}
        >
          <IssueCard issue={issue} />
        </StaggerItem>
      ))}
    </Stagger>
  )
}
