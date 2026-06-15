"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink, GitPullRequest, Bookmark, Check, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getLabelStyle, cn } from "@/lib/utils"
import { ActionToggle } from "@/components/issues/action-toggle"
import type { SavedIssue } from "@/lib/types"

interface SavedIssueCardProps {
  item: SavedIssue
  onToggleSaved: (item: SavedIssue) => void
  onToggleDone: (item: SavedIssue) => void
  onRemove: (item: SavedIssue) => void
  pending?: boolean
}

export function SavedIssueCard({
  item,
  onToggleSaved,
  onToggleDone,
  onRemove,
  pending,
}: SavedIssueCardProps) {
  const isOpen = item.state === "open"

  return (
    <div className="group relative h-full">
      <div
        className={cn(
          "relative flex h-full flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-foreground/[0.03] ring-1 ring-foreground/[0.04] transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/8",
          item.done && "border-emerald-500/30 ring-emerald-500/10"
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2 py-1 text-xs font-medium text-secondary-foreground">
              <GitPullRequest className="size-3 shrink-0 text-muted-foreground" />
              <span className="max-w-[150px] truncate">{item.repoFullName}</span>
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
                isOpen
                  ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item.state}
            </span>
            {item.done && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Done
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            asChild
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Link
              href={item.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open on GitHub"
            >
              <ExternalLink />
            </Link>
          </Button>
        </div>

        <Link
          href={item.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mb-3 block text-sm font-semibold leading-snug text-card-foreground transition-colors hover:text-primary",
            item.done && "text-muted-foreground line-through decoration-emerald-500/40"
          )}
        >
          <span className="text-muted-foreground">#{item.number}</span> {item.title}
        </Link>

        {item.labels && item.labels.length > 0 && (
          <div className="mb-4 flex min-h-5 flex-wrap gap-1">
            {item.labels.slice(0, 4).map((label) => {
              const labelStyle = getLabelStyle(label.name, label.color)
              return (
                <Badge
                  key={label.name}
                  variant="outline"
                  className={`px-1.5 py-0 text-[10px] font-normal ${labelStyle.className}`}
                  style={labelStyle.style}
                >
                  {label.name}
                </Badge>
              )
            })}
          </div>
        )}

        <div className="mt-auto flex items-center gap-1 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
          <span className="truncate">
            {item.done && item.doneAt
              ? `done ${formatDistanceToNow(new Date(item.doneAt), { addSuffix: true })}`
              : `saved ${formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}`}
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            <ActionToggle
              icon={Bookmark}
              active={item.saved}
              onToggle={() => onToggleSaved(item)}
              pending={pending}
              tone="primary"
              fillWhenActive
              ariaLabel={item.saved ? "Remove bookmark" : "Save"}
              title={item.saved ? "Saved" : "Save"}
            />
            <ActionToggle
              icon={Check}
              active={item.done}
              onToggle={() => onToggleDone(item)}
              pending={pending}
              tone="emerald"
              ariaLabel={item.done ? "Mark as not done" : "Mark as done"}
              title={item.done ? "Done" : "Mark done"}
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onRemove(item)}
              disabled={pending}
              aria-label="Remove from my issues"
              title="Remove"
              className="text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
