"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink, GitPullRequest, Bookmark, Check, Trash2, Edit3, Save, X, Link2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getLabelStyle, cn } from "@/lib/utils"
import { ActionToggle } from "@/components/issues/action-toggle"
import { useTheme } from "@/hooks/use-theme"
import { usePatchSavedIssue } from "@/hooks/use-saved-issues"
import { Markdown } from "@/components/shared/markdown"
import type { SavedIssue } from "@/lib/types"

interface SavedIssueCardProps {
  item: SavedIssue
  onToggleSaved: (item: SavedIssue) => void
  onToggleDone: (item: SavedIssue) => void
  onRemove: (item: SavedIssue) => void
  pending?: boolean
  detailView?: boolean
  selected?: boolean
  onToggleSelect?: (id: number) => void
}

export function SavedIssueCard({
  item,
  onToggleSaved,
  onToggleDone,
  onRemove,
  pending,
  detailView = true,
  selected,
  onToggleSelect,
}: SavedIssueCardProps) {
  const patch = usePatchSavedIssue()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [isEditing, setIsEditing] = useState(false)
  const [noteText, setNoteText] = useState(item.note || "")
  const [prUrlText, setPrUrlText] = useState(item.prUrl || "")

  const isOpen = item.state === "open"
  const currentStatus = item.status || (item.done ? "DONE" : "BACKLOG")

  const handleSaveNotes = () => {
    patch.mutate({
      issueId: item.issueId,
      note: noteText.trim() || null,
      prUrl: prUrlText.trim() || null,
    }, {
      onSuccess: () => {
        setIsEditing(false)
      }
    })
  }

  const handleStatusChange = (newStatus: string) => {
    patch.mutate({
      issueId: item.issueId,
      status: newStatus,
    })
  }

  const handleCancel = () => {
    setNoteText(item.note || "")
    setPrUrlText(item.prUrl || "")
    setIsEditing(false)
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", item.issueId.toString())
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <div
      className="group relative h-full cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
    >
      <div
        className={cn(
          "relative flex h-full flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-foreground/[0.03] ring-1 ring-foreground/[0.04] transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/8",
          item.done && "border-emerald-500/30 ring-emerald-500/10 bg-emerald-500/[0.01]",
          currentStatus === "IN_PROGRESS" && "border-amber-500/20 ring-amber-500/5 bg-amber-500/[0.005]",
          currentStatus === "IN_REVIEW" && "border-blue-500/20 ring-blue-500/5 bg-blue-500/[0.005]"
        )}
      >
        {/* Card Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={!!selected}
                onChange={() => onToggleSelect(item.issueId)}
                className="size-4 rounded border-border accent-primary cursor-pointer shrink-0"
              />
            )}
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
          </div>
          
          {detailView && (
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
          )}
        </div>

        {/* Issue Title */}
        <Link
          href={item.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mb-3 block text-sm font-semibold leading-snug text-card-foreground transition-colors hover:text-primary",
            item.done && "text-muted-foreground line-through decoration-emerald-500/40"
          )}
        >
          <span className="text-muted-foreground font-medium">#{item.number}</span> {item.title}
        </Link>

        {/* Labels */}
        {detailView && item.labels && item.labels.length > 0 && (
          <div className="mb-4 flex min-h-5 flex-wrap gap-1">
            {item.labels.slice(0, 3).map((label) => {
              const labelStyle = getLabelStyle(label.name, label.color, isDark)
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

        {/* Notes & PR Details */}
        {detailView ? (
        <div className="mb-4 rounded-xl bg-secondary/35 border border-border/40 p-2.5 space-y-2">
          {isEditing ? (
            <div className="space-y-2.5">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">PR URL</span>
                <div className="relative group/input">
                  <Link2 className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    type="text"
                    placeholder="https://github.com/..."
                    value={prUrlText}
                    onChange={(e) => setPrUrlText(e.target.value)}
                    className="h-7 pl-7 pr-2 text-xs rounded-lg border-border/70 bg-background/50 focus-visible:ring-primary/30"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Personal Notes</span>
                <textarea
                  placeholder="Notes, todo items, ideas..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[60px] w-full rounded-lg border border-border/70 bg-background/50 p-2 text-xs outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 resize-y"
                />
              </div>
              <div className="flex justify-end gap-1.5">
                <Button variant="ghost" size="xs" onClick={handleCancel} disabled={patch.isPending}>
                  <X className="size-3 mr-1" />
                  Cancel
                </Button>
                <Button size="xs" onClick={handleSaveNotes} disabled={patch.isPending}>
                  <Save className="size-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Notes & Progress</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center text-[10px] font-medium text-primary hover:underline gap-1 cursor-pointer"
                >
                  <Edit3 className="size-3" />
                  {item.note || item.prUrl ? "Edit" : "Add note"}
                </button>
              </div>

              {item.prUrl && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/8 border border-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/12">
                  <GitPullRequest className="size-3" />
                  <Link href={item.prUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5">
                    PR Link
                    <ExternalLink className="size-2.5" />
                  </Link>
                </div>
              )}

              {item.note ? (
                <div className="text-xs text-foreground max-h-[100px] overflow-y-auto leading-relaxed pr-1 select-text">
                  <Markdown content={item.note} />
                </div>
              ) : !item.prUrl ? (
                <p className="text-[11px] text-muted-foreground/60 italic">No notes added yet.</p>
              ) : null}
            </div>
          )}
        </div>
        ) : null}

        {/* Card Footer (Status and Actions) */}
        <div className="mt-auto flex items-center justify-between gap-1 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
          {/* Kanban Status dropdown selector */}
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={patch.isPending || pending}
            className="rounded-lg border border-border/80 bg-background/80 px-2 py-1 text-[11px] font-semibold text-muted-foreground outline-none ring-primary/45 focus:ring-1 cursor-pointer"
          >
            <option value="BACKLOG">📋 Saved</option>
            <option value="IN_PROGRESS">⚡ In Progress</option>
            <option value="IN_REVIEW">🔍 In Review</option>
            <option value="DONE">🎉 Completed</option>
          </select>

          {/* Quick actions toggle */}
          <div className="flex shrink-0 items-center gap-0.5">
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
              className="text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
