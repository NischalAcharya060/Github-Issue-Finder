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
  bug: "bg-red-500/12 text-red-600 dark:text-red-400 border-red-500/25 shadow-[inset_0_0_0_1px_oklch(0.577_0.245_27.325/0.15)] dark:shadow-[inset_0_0_0_1px_oklch(0.704_0.191_22.216/0.15)]",
  enhancement:
    "bg-blue-500/12 text-blue-600 dark:text-blue-400 border-blue-500/25 shadow-[inset_0_0_0_1px_oklch(0.546_0.245_262.881/0.15)] dark:shadow-[inset_0_0_0_1px_oklch(0.623_0.214_259.815/0.15)]",
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

  return (
    <div className="group relative">
      <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative rounded-xl border bg-card p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-primary/5">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-md bg-secondary/50 px-1.5 py-0.5 font-medium text-secondary-foreground">
              <GitPullRequest className="size-3" />
              <span className="truncate max-w-[140px]">{repoFullName}</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                issue.state === "open"
                  ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  issue.state === "open"
                    ? "bg-emerald-500"
                    : "bg-muted-foreground"
                }`}
              />
              {issue.state}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            asChild
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Link
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink />
            </Link>
          </Button>
        </div>

        <Link
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 block text-sm font-medium leading-snug text-card-foreground transition-colors hover:text-primary"
        >
          {issue.title}
        </Link>

        <div className="mb-3 flex min-h-5 flex-wrap gap-1">
          {issue.labels.slice(0, 5).map((label) => (
            <Badge
              key={label.id}
              variant="outline"
              className={`border px-1.5 py-0 text-[10px] font-normal ${getLabelClassName(label.name, label.color)}`}
            >
              {label.name}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {issue.user && (
            <span className="flex items-center gap-1.5">
              <Image
                src={issue.user.avatar_url}
                alt={issue.user.login}
                width={16}
                height={16}
                className="size-4 rounded-full ring-1 ring-border"
              />
              <span className="max-w-[80px] truncate">{issue.user.login}</span>
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
