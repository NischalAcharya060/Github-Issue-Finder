"use client"

import { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Star, ExternalLink, GitPullRequest, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getLabelStyle, cn, getRepoFromUrl } from "@/lib/utils"
import { IssueActions } from "@/components/issues/issue-actions"
import { useSavedIssuesMap } from "@/hooks/use-saved-issues"
import { useIgnoredRepos } from "@/hooks/use-ignored-repos"
import { useTheme } from "@/hooks/use-theme"
import type { GitHubIssue } from "@/lib/types"

interface IssueCardProps {
  issue: GitHubIssue
  selected?: boolean
  onToggleSelect?: (id: number) => void
}

export const IssueCard = memo(function IssueCard({ issue, selected, onToggleSelect }: IssueCardProps) {
  const repoFullName = getRepoFromUrl(issue.repository_url)
  const isOpen = issue.state === "open"
  const { map } = useSavedIssuesMap()
  const isDone = map.get(issue.id)?.done ?? false
  const { addIgnoredRepo } = useIgnoredRepos()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="group relative h-full">
      <div className="card-glow absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div
        className={cn(
          "relative flex h-full flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-foreground/[0.03] ring-1 ring-foreground/[0.04] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/8",
          isDone && "border-blue-500/30 ring-blue-500/10"
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={!!selected}
                onChange={(e) => {
                  e.stopPropagation()
                  onToggleSelect(issue.id)
                }}
                onClick={(e) => e.stopPropagation()}
                className="mr-1 mt-0.5 size-4 shrink-0 cursor-pointer rounded border-border accent-primary"
                aria-label={`Select issue ${issue.id}`}
              />
            )}
            <span className="flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2 py-1 text-xs font-medium text-secondary-foreground">
              <GitPullRequest className="size-3 shrink-0 text-muted-foreground" />
              <span className="max-w-[150px] truncate">{repoFullName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  addIgnoredRepo(repoFullName)
                }}
                className="ml-0.5 shrink-0 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title={`Hide all issues from ${repoFullName}`}
                aria-label={`Ignore ${repoFullName}`}
              >
                <EyeOff className="size-3" />
              </button>
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                isOpen
              ? "bg-emerald-500/12 text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <span className="relative flex size-1.5">
            {isOpen && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            )}
            <span
              className={`relative inline-flex size-1.5 rounded-full ${
                isOpen ? "bg-emerald-400" : "bg-muted-foreground"
              }`}
            />
              </span>
              {issue.state}
            </span>
            {isDone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-400">
                Done
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            asChild
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Link
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open on GitHub"
            >
              <ExternalLink />
            </Link>
          </Button>
        </div>

        <Link
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mb-3 block text-sm font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary"
        >
          {issue.title}
        </Link>

        {issue.labels.length > 0 && (
          <div className="mb-4 flex min-h-5 flex-wrap gap-1">
            {issue.labels.slice(0, 4).map((label) => {
              const labelStyle = getLabelStyle(label.name, label.color, isDark)
              return (
                <Badge
                  key={label.id}
                  variant="outline"
                  className={`px-1.5 py-0 text-[10px] font-normal ${labelStyle.className}`}
                  style={labelStyle.style}
                >
                  {label.name}
                </Badge>
              )
            })}
            {issue.labels.length > 4 && (
              <Badge
                variant="outline"
                className="border-border/70 px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
              >
                +{issue.labels.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="mb-3 flex items-center gap-1">
          <IssueActions issue={issue} />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
          {issue.user && (
            <span className="flex items-center gap-1.5">
              <Image
                src={issue.user.avatar_url}
                alt={issue.user.login}
                width={18}
                height={18}
                className="size-4.5 rounded-full ring-1 ring-border"
              />
              <span className="max-w-[80px] truncate font-medium">
                {issue.user.login}
              </span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="size-3" />
            {issue.score}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3" />
            {issue.comments}
          </span>
          <span className="ml-auto">
            {formatDistanceToNow(new Date(issue.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </div>
  )
})
