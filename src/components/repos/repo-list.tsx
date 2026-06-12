"use client"

import Link from "next/link"
import { Star, GitFork, ExternalLink, Code2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { RepoSearchResponse, GitHubRepo } from "@/lib/types"

interface RepoListProps {
  data: RepoSearchResponse | undefined
  isLoading: boolean
  isError: boolean
}

export function RepoList({ data, isLoading, isError }: RepoListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Skeleton className="mb-2 h-5 w-3/4" />
            <Skeleton className="mb-3 h-3 w-full" />
            <Skeleton className="mb-3 h-3 w-2/3" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
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
          Failed to fetch repositories. Try again later.
        </p>
      </div>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
          <Code2 className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mb-1.5 text-lg font-semibold">No repositories found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {data.items.map((repo: GitHubRepo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  )
}

function RepoCard({ repo }: { repo: GitHubRepo }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative rounded-xl border bg-card p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <Link
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-card-foreground transition-colors hover:text-primary"
          >
            {repo.full_name}
          </Link>
          <Link
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <ExternalLink className="size-3.5 text-muted-foreground hover:text-foreground" />
          </Link>
        </div>

        {repo.description && (
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {repo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-primary/60" />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="size-3" />
            {repo.stargazers_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="size-3" />
            {repo.forks_count ?? 0}
          </span>
        </div>
      </div>
    </div>
  )
}
