"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Eye,
  Heart,
  Hash,
  GitPullRequest,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getLabelStyle } from "@/lib/utils"
import { Markdown } from "@/components/shared/markdown"
import { IssueActions } from "@/components/issues/issue-actions"
import type { GitHubIssue, GitHubLabel } from "@/lib/types"

interface IssueDetailModalProps {
  issueId: number | null
  issues: GitHubIssue[]
  onClose: () => void
}

function getRepoFromUrl(url: string): string {
  return url.replace("https://api.github.com/repos/", "")
}

export function IssueDetailModal({
  issueId,
  issues,
  onClose,
}: IssueDetailModalProps) {
  const issue = issueId ? issues.find((i) => i.id === issueId) : null

  if (!issue) return null

  const isOpen = issue.state === "open"
  const repo = getRepoFromUrl(issue.repository_url)

  return (
    <Dialog open={!!issueId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pr-8">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2 py-1 font-medium">
              <GitPullRequest className="size-3 text-muted-foreground" />
              {repo}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                isOpen
                  ? "bg-emerald-500/12 text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isOpen ? "bg-emerald-400" : "bg-muted-foreground"
                }`}
              />
              {issue.state}
            </span>
            <span className="flex items-center gap-0.5 text-muted-foreground">
              <Hash className="size-3" />
              {issue.number}
            </span>
          </div>
          <DialogTitle className="text-lg leading-snug">
            {issue.title}
          </DialogTitle>
          <DialogDescription>
            Opened by {issue.user?.login} ·{" "}
            {formatDistanceToNow(new Date(issue.created_at), {
              addSuffix: true,
            })}
          </DialogDescription>
        </DialogHeader>

        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {issue.labels.map((label: GitHubLabel) => {
              const labelStyle = getLabelStyle(label.name, label.color)
              return (
                <Badge
                  key={label.id}
                  variant="outline"
                  className={`text-[11px] font-normal ${labelStyle.className}`}
                  style={labelStyle.style}
                >
                  {label.name}
                </Badge>
              )
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-border/70 bg-card/60 p-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Comments
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-sm font-semibold">
              <MessageSquare className="size-3.5 text-muted-foreground" />
              {issue.comments}
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/60 p-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Score
            </div>
            <div className="mt-0.5 text-sm font-semibold">
              {issue.score.toFixed(1)}
            </div>
          </div>
          {issue.reactions && (
            <>
              <div className="rounded-xl border border-border/70 bg-card/60 p-3">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Reactions
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-sm font-semibold">
                  {issue.reactions["+1"] > 0 && (
                    <span className="flex items-center gap-0.5">
                      <ThumbsUp className="size-3.5 text-muted-foreground" />
                      {issue.reactions["+1"]}
                    </span>
                  )}
                  {issue.reactions.heart > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Heart className="size-3.5 text-muted-foreground" />
                      {issue.reactions.heart}
                    </span>
                  )}
                  {issue.reactions["+1"] === 0 &&
                    issue.reactions.heart === 0 && (
                      <span className="text-muted-foreground">—</span>
                    )}
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/60 p-3">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Watching
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-sm font-semibold">
                  <Eye className="size-3.5 text-muted-foreground" />
                  {issue.reactions.eyes ?? 0}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="my-2 max-h-[35vh] overflow-y-auto rounded-xl border border-border/60 bg-secondary/15 p-4 shadow-inner">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </div>
          <Markdown content={issue.body || ""} />
        </div>

        <div className="space-y-3 border-t border-border/50 pt-3">
          <IssueActions issue={issue} variant="grid" />

          <div className="flex items-center justify-between gap-3">
            {issue.user && (
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <Image
                  src={issue.user.avatar_url}
                  alt={issue.user.login}
                  width={24}
                  height={24}
                  className="size-6 rounded-full ring-1 ring-border"
                />
                <span className="font-medium text-foreground">
                  {issue.user.login}
                </span>
              </span>
            )}
            <Button variant="default" size="sm" asChild>
              <Link
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-1.5"
              >
                <ExternalLink className="size-3.5" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
