"use client"

import Link from "next/link"
import { signIn, useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import {
  ExternalLink,
  MessageSquare,
  AlertCircle,
  GitPullRequest,
  CircleCheck,
  Circle,
  SearchX,
  Bookmark,
  Loader2,
  Hash,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Stagger, StaggerItem } from "@/components/motion/motion-primitives"
import { getLabelStyle } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"
import { useSavedReposMap, useToggleSaveRepo } from "@/hooks/use-saved-repos"
import { IssueActions } from "@/components/issues/issue-actions"
import type { GitHubIssue, GitHubRepo } from "@/lib/types"

interface RepoIssuesModalProps {
  repo: GitHubRepo
  issues: GitHubIssue[] | null
  isLoading: boolean
  isError: boolean
  onClose: () => void
}

export function RepoIssuesModal({
  repo,
  issues,
  isLoading,
  isError,
  onClose,
}: RepoIssuesModalProps) {
  const { theme } = useTheme()
  const { status } = useSession()
  const isDark = theme === "dark"
  const { map } = useSavedReposMap()
  const toggle = useToggleSaveRepo()
  const isSaved = map.has(repo.full_name)
  const savePending = toggle.isPending && toggle.variables?.repo.full_name === repo.full_name

  const handleSave = () => {
    if (status !== "authenticated") {
      signIn("github")
      return
    }
    toggle.mutate({ repo, saved: !isSaved })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl gap-0 p-0">
        <div className="sticky top-0 z-10 rounded-t-xl bg-popover">
          <DialogHeader className="px-5 pt-5 pb-3 pr-12">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
              <div className="flex items-center gap-2">
                <GitPullRequest className="size-3.5" />
                <span>Repository</span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleSave}
                disabled={savePending}
                className={isSaved ? "text-primary" : "text-muted-foreground"}
                title={isSaved ? "Remove from saved" : "Save repository"}
              >
                {savePending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Bookmark className={`size-4 ${isSaved ? "fill-primary" : ""}`} />
                )}
              </Button>
            </div>
            <DialogTitle className="text-lg">
              {repo.full_name}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CircleCheck className="size-3 text-emerald-400" />
                {issues
                  ? `${issues.length} open issue${issues.length !== 1 ? "s" : ""}`
                  : "Open issues"}
              </span>
            </div>
          </DialogHeader>
        </div>

        <div className="px-5 pb-5">
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border/50 p-3"
                >
                  <Skeleton className="mt-1 size-3 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="size-6 text-destructive" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Failed to load issues
                </p>
                <p className="mt-1 text-xs">
                  This repository may be private or unavailable.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="mt-2 cursor-pointer"
              >
                Close
              </Button>
            </div>
          )}

          {!isLoading && !isError && issues && issues.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <SearchX className="size-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  No open issues
                </p>
                <p className="mt-1 text-xs">
                  This repository has no open issues right now.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mt-2"
              >
                <Link
                  href={`https://github.com/${repo.full_name}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1.5"
                >
                  <ExternalLink className="size-3.5" />
                  View on GitHub
                </Link>
              </Button>
            </div>
          )}

          {!isLoading && !isError && issues && issues.length > 0 && (
            <Stagger stagger={0.03} className="space-y-1.5">
              {issues.map((issue) => (
                <StaggerItem key={issue.id}>
                  <div className="rounded-xl border border-border/50 p-3 transition-colors hover:bg-muted/40 hover:border-border">
                    <div className="flex items-start gap-3">
                      <Circle className="mt-0.5 size-3 shrink-0 text-emerald-400 fill-emerald-400/20" />
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <div className="flex items-start gap-2">
                          <Link
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium leading-snug text-card-foreground transition-colors hover:text-primary"
                          >
                            {issue.title}
                          </Link>
                          <span className="shrink-0 text-xs text-muted-foreground flex items-center gap-0.5">
                            <Hash className="size-2.5" />
                            {issue.number}
                          </span>
                        </div>
                        {issue.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {issue.labels.slice(0, 4).map((label) => {
                              const labelStyle = getLabelStyle(
                                label.name,
                                label.color,
                                isDark
                              )
                              return (
                                <Badge
                                  key={label.id}
                                  variant="outline"
                                  className={`px-1.5 py-0 text-[9px] font-normal leading-tight ${labelStyle.className}`}
                                  style={labelStyle.style}
                                >
                                  {label.name}
                                </Badge>
                              )
                            })}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                          {issue.user && (
                            <span className="font-medium">
                              {issue.user.login}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MessageSquare className="size-3" />
                            {issue.comments}
                          </span>
                          <span>
                            {formatDistanceToNow(
                              new Date(issue.created_at),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                      <IssueActions issue={issue} variant="compact" />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-between rounded-b-xl border-t border-border/50 bg-popover px-5 py-3">
          <span className="text-xs text-muted-foreground">
            {issues
              ? `Showing ${issues.length} open issue${issues.length !== 1 ? "s" : ""}`
              : ""}
          </span>
          <Button variant="default" size="sm" asChild>
            <Link
              href={`https://github.com/${repo.full_name}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-1.5"
            >
              <ExternalLink className="size-3.5" />
              View all on GitHub
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
