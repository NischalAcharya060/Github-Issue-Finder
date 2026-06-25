"use client"

import Link from "next/link"
import { signIn, useSession } from "next-auth/react"
import {
  Star,
  GitFork,
  ExternalLink,
  Code2,
  AlertTriangle,
  EyeOff,
  Bookmark,
  Loader2,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { StatePanel } from "@/components/shared/state-panel"
import { Stagger, StaggerItem } from "@/components/motion/motion-primitives"
import { useIgnoredRepos } from "@/hooks/use-ignored-repos"
import { useSavedReposMap, useToggleSaveRepo } from "@/hooks/use-saved-repos"
import type { RepoSearchResponse, GitHubRepo } from "@/lib/types"

interface RepoListProps {
  data: RepoSearchResponse | undefined
  isLoading: boolean
  isError: boolean
  onRepoClick: (repo: GitHubRepo) => void
}

export function RepoList({ data, isLoading, isError, onRepoClick }: RepoListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/70 bg-card p-4"
          >
            <Skeleton className="mb-2 h-5 w-3/4" />
            <Skeleton className="mb-3 h-3 w-full" />
            <Skeleton className="mb-4 h-3 w-2/3" />
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
      <StatePanel
        icon={AlertTriangle}
        tone="error"
        title="Something went wrong"
        description="Failed to fetch repositories. Try again later."
      />
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <StatePanel
        icon={Code2}
        title="No repositories found"
        description="Try adjusting your search keywords or filters."
      />
    )
  }

  return (
    <Stagger stagger={0.05} className="grid gap-4 sm:grid-cols-2">
      {data.items.map((repo: GitHubRepo) => (
        <StaggerItem key={repo.id}>
          <RepoCard
            repo={repo}
            onClick={() => onRepoClick(repo)}
          />
        </StaggerItem>
      ))}
    </Stagger>
  )
}

interface RepoCardProps {
  repo: GitHubRepo
  onClick: () => void
}

function RepoCard({ repo, onClick }: RepoCardProps) {
  const { addIgnoredRepo } = useIgnoredRepos()
  const { status } = useSession()
  const { map } = useSavedReposMap()
  const toggle = useToggleSaveRepo()
  const isSaved = map.has(repo.full_name)
  const savePending = toggle.isPending && toggle.variables?.repo.full_name === repo.full_name

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (status !== "authenticated") {
      signIn("github")
      return
    }
    toggle.mutate({ repo, saved: !isSaved })
  }

  return (
    <div className="group relative h-full">
      <div className="card-glow absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <button
        onClick={onClick}
        className="relative flex h-full w-full cursor-pointer flex-col rounded-2xl border border-border/70 bg-card p-4 text-left shadow-sm shadow-foreground/[0.03] ring-1 ring-foreground/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/8 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-card-foreground transition-colors group-hover:text-primary">
            {repo.full_name}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleSave}
              disabled={savePending}
              className={`transition-all cursor-pointer ${
                isSaved
                  ? "text-primary opacity-100"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100"
              } hover:text-primary`}
              title={isSaved ? "Remove from saved" : "Save repository"}
              aria-label={isSaved ? "Remove from saved" : "Save repository"}
            >
              {savePending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Bookmark className={`size-3.5 ${isSaved ? "fill-primary" : ""}`} />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                addIgnoredRepo(repo.full_name)
              }}
              className="text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover:opacity-100 cursor-pointer"
              title={`Hide ${repo.full_name} from results`}
              aria-label={`Ignore ${repo.full_name}`}
            >
              <EyeOff className="size-3.5" />
            </button>
            <Link
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open on GitHub"
              className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            >
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>

        {repo.description && (
          <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {repo.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-2 rounded-full bg-primary" />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="size-3" />
            {repo.stargazers_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="size-3" />
            {(repo.forks_count ?? 0).toLocaleString()}
          </span>
        </div>
      </button>
    </div>
  )
}
