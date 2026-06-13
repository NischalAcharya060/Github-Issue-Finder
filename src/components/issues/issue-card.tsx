"use client"

import { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Star, ExternalLink, GitPullRequest } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GitHubIssue } from "@/lib/types"

function getRepoFromUrl(url: string): string {
  return url.replace("https://api.github.com/repos/", "")
}

const labelStyles: Record<string, string> = {
  bug: "bg-red-500/12 text-red-600 dark:text-red-400 border-red-500/25",
  enhancement:
    "bg-blue-500/12 text-blue-600 dark:text-blue-400 border-blue-500/25",
  documentation:
    "bg-purple-500/12 text-purple-600 dark:text-purple-400 border-purple-500/25",
  "good first issue":
    "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  "help wanted":
    "bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25",
  beginner:
    "bg-teal-500/12 text-teal-600 dark:text-teal-400 border-teal-500/25",
  question:
    "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400 border-cyan-500/25",
}

function getLabelClassName(name: string, color: string): string {
  const lower = name.toLowerCase()
  if (labelStyles[lower]) return labelStyles[lower]
  return `bg-[${color}]/10 text-foreground border-[${color}]/25`
}

interface IssueCardProps {
  issue: GitHubIssue
}

export const IssueCard = memo(function IssueCard({ issue }: IssueCardProps) {
  const repoFullName = getRepoFromUrl(issue.repository_url)
  const isOpen = issue.state === "open"

  return (
    <div className="group relative h-full">
      <div className="card-glow absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-foreground/[0.03] ring-1 ring-foreground/[0.04] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/8">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2 py-1 text-xs font-medium text-secondary-foreground">
              <GitPullRequest className="size-3 shrink-0 text-muted-foreground" />
              <span className="max-w-[150px] truncate">{repoFullName}</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                isOpen
                  ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="relative flex size-1.5">
                {isOpen && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                )}
                <span
                  className={`relative inline-flex size-1.5 rounded-full ${
                    isOpen ? "bg-emerald-500" : "bg-muted-foreground"
                  }`}
                />
              </span>
              {issue.state}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            asChild
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
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
            {issue.labels.slice(0, 4).map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                className={`border px-1.5 py-0 text-[10px] font-normal ${getLabelClassName(label.name, label.color)}`}
              >
                {label.name}
              </Badge>
            ))}
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
