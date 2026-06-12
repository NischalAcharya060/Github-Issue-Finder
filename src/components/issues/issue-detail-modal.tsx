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
import type { GitHubIssue, GitHubLabel } from "@/lib/types"

interface IssueDetailModalProps {
  issueId: number | null
  issues: GitHubIssue[]
  onClose: () => void
}

export function IssueDetailModal({
  issueId,
  issues,
  onClose,
}: IssueDetailModalProps) {
  const issue = issueId ? issues.find((i) => i.id === issueId) : null

  if (!issue) return null

  return (
    <Dialog open={!!issueId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base leading-snug">
            {issue.title}
          </DialogTitle>
          <DialogDescription>
            <span className="text-xs text-muted-foreground">
              #{issue.number} by {issue.user?.login} ·{" "}
              {formatDistanceToNow(new Date(issue.created_at), {
                addSuffix: true,
              })}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {issue.labels.map((label: GitHubLabel) => (
            <Badge key={label.id} variant="outline" className="text-[11px]">
              {label.name}
            </Badge>
          ))}
        </div>

        {issue.reactions && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {issue.reactions["+1"] > 0 && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="size-3.5" /> {issue.reactions["+1"]}
              </span>
            )}
            {issue.reactions["-1"] > 0 && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="size-3.5 -scale-x-100" />{" "}
                {issue.reactions["-1"]}
              </span>
            )}
            {issue.reactions.heart > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="size-3.5" /> {issue.reactions.heart}
              </span>
            )}
            {issue.reactions.eyes > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="size-3.5" /> {issue.reactions.eyes}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {issue.user && (
            <span className="flex items-center gap-1.5">
              <Image
                src={issue.user.avatar_url}
                alt={issue.user.login}
                width={20}
                height={20}
                className="size-5 rounded-full ring-1 ring-border"
              />
              {issue.user.login}
            </span>
          )}
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {issue.comments} comments
          </span>
          <span>Score: {issue.score}</span>
        </div>

        <div className="pt-2">
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
      </DialogContent>
    </Dialog>
  )
}
