"use client"

import { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Star, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GitHubIssue } from "@/lib/types"

function getRepoFromUrl(url: string): string {
  return url.replace("https://api.github.com/repos/", "")
}

const labelColors: Record<string, string> = {
  bug: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  enhancement:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  documentation:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "good first issue":
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "help wanted":
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  beginner:
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  question:
    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
}

function getLabelClassName(name: string, color: string): string {
  const lower = name.toLowerCase()
  if (labelColors[lower]) return labelColors[lower]
  return `bg-[${color}]/10 text-foreground border-[${color}]/30`
}

interface IssueCardProps {
  issue: GitHubIssue
}

export const IssueCard = memo(function IssueCard({ issue }: IssueCardProps) {
  const repoFullName = getRepoFromUrl(issue.repository_url)

  return (
    <Card size="sm" className="group transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{repoFullName}</span>
            <span
              className={`size-1.5 rounded-full ${
                issue.state === "open" ? "bg-emerald-500" : "bg-gray-400"
              }`}
            />
            <span>{issue.state}</span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            asChild
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
        <CardTitle className="line-clamp-2">
          <Link
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {issue.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {issue.labels.slice(0, 5).map((label) => (
            <Badge
              key={label.id}
              variant="outline"
              className={getLabelClassName(label.name, label.color)}
            >
              {label.name}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {issue.user && (
            <span className="flex items-center gap-1">
              <Image
                src={issue.user.avatar_url}
                alt={issue.user.login}
                width={16}
                height={16}
                className="size-4 rounded-full"
              />
              {issue.user.login}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="size-3.5" />
            {issue.score}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {issue.comments}
          </span>
          <span>
            {formatDistanceToNow(new Date(issue.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
})
