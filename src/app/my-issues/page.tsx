"use client"

import { useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { useSession, signIn } from "next-auth/react"
import { toast } from "sonner"
import { GitBranch, Bookmark, CheckCircle2, LogIn, ArrowLeft, Kanban, List, Eye, EyeOff, Zap, Search, Plus, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { AuthButton } from "@/components/auth/auth-button"
import { StatePanel } from "@/components/shared/state-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { SavedIssueCard } from "@/components/issues/saved-issue-card"
import { Stagger, StaggerItem } from "@/components/motion/motion-primitives"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { cn } from "@/lib/utils"
import {
  useSavedIssues,
  usePatchSavedIssue,
  useRemoveSavedIssue,
} from "@/hooks/use-saved-issues"
import { ExportButton } from "@/components/shared/export-button"
import type { SavedIssue, GitHubIssue } from "@/lib/types"

type Tab = "saved" | "done"
type ViewMode = "board" | "list"

export default function MyIssuesPage() {
  const { status } = useSession()
  const [tab, setTab] = useState<Tab>("saved")
  const [viewMode, setViewMode] = useState<ViewMode>("board")
  const [detailView, setDetailView] = useState(true)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<number>>(new Set())
  const { data, isLoading } = useSavedIssues("all")
  const patch = usePatchSavedIssue()
  const remove = useRemoveSavedIssue()

  const pending = patch.isPending || remove.isPending
  const [confirmRemove, setConfirmRemove] = useState<SavedIssue | null>(null)
  const [confirmBulkRemove, setConfirmBulkRemove] = useState(false)

  const handleToggleSaved = useCallback((it: SavedIssue) => {
    patch.mutate(
      { issueId: it.issueId, saved: !it.saved },
      {
        onSuccess: (res) => {
          toast.success(res.saved ? "Issue saved" : "Bookmark removed")
        },
        onError: () => {
          toast.error("Failed to update issue")
        },
      }
    )
  }, [patch])

  const handleToggleDone = useCallback((it: SavedIssue) => {
    patch.mutate(
      { issueId: it.issueId, done: !it.done },
      {
        onSuccess: (res) => {
          toast.success(res.done ? "Marked as done" : "Marked as not done")
        },
        onError: () => {
          toast.error("Failed to update issue")
        },
      }
    )
  }, [patch])

  const handleConfirmRemove = useCallback(() => {
    if (!confirmRemove) return
    remove.mutate(confirmRemove.issueId, {
      onSuccess: () => {
        toast.success("Issue removed", {
          description: `#${confirmRemove.number} has been removed from your issues.`,
        })
        setConfirmRemove(null)
      },
      onError: () => {
        toast.error("Failed to remove issue")
      },
    })
  }, [confirmRemove, remove])

  const allItems = data ?? []

  const toggleSelectIssue = useCallback((issueId: number) => {
    setSelectedIssueIds((prev) => {
      const next = new Set(prev)
      if (next.has(issueId)) next.delete(issueId)
      else next.add(issueId)
      return next
    })
  }, [])

  const allIds = allItems.map((i) => i.issueId)
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIssueIds.has(id))

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIssueIds(new Set())
    } else {
      setSelectedIssueIds(new Set(allIds))
    }
  }, [allSelected, allIds])

  const clearSelection = useCallback(() => {
    setSelectedIssueIds(new Set())
    setBulkMode(false)
  }, [])

  const selectedObjects = allItems.filter((i) => selectedIssueIds.has(i.issueId))

  const bulkExportFilename = `saved-issues-${selectedObjects.length}-selected`

  const bulkMarkDone = () => {
    selectedObjects.forEach((it) => {
      patch.mutate({ issueId: it.issueId, done: true })
    })
    setSelectedIssueIds(new Set())
  }

  const bulkRemove = () => {
    selectedObjects.forEach((it) => {
      remove.mutate(it.issueId)
    })
    setSelectedIssueIds(new Set())
    setConfirmBulkRemove(false)
  }

  const { saved, done, backlog, inProgress, inReview, completed } = useMemo(() => {
    const all = data ?? []
    return {
      saved: all.filter((i) => i.saved),
      done: all.filter((i) => i.done),
      backlog: all.filter((i) => i.status === "BACKLOG" || (!i.status && !i.done)),
      inProgress: all.filter((i) => i.status === "IN_PROGRESS"),
      inReview: all.filter((i) => i.status === "IN_REVIEW"),
      completed: all.filter((i) => i.status === "DONE" || (!i.status && i.done)),
    }
  }, [data])

  const items = tab === "saved" ? saved : done
  const loading = isLoading || status === "loading"

  const tabs: { value: Tab; label: string; icon: typeof Bookmark; count: number }[] = [
    { value: "saved", label: "Saved", icon: Bookmark, count: saved.length },
    { value: "done", label: "Done", icon: CheckCircle2, count: done.length },
  ]

  const kanbanColumns = [
    { id: "BACKLOG", title: "Saved", icon: Bookmark, items: backlog, accent: "text-muted-foreground", barClass: "bg-muted-foreground/30", dotClass: "bg-muted-foreground/50", badgeClass: "bg-muted-foreground/10 text-muted-foreground" },
    { id: "IN_PROGRESS", title: "In Progress", icon: Zap, items: inProgress, accent: "text-amber-500", barClass: "bg-amber-500/40", dotClass: "bg-amber-500", badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { id: "IN_REVIEW", title: "In Review", icon: Search, items: inReview, accent: "text-blue-500", barClass: "bg-blue-500/40", dotClass: "bg-blue-500", badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { id: "DONE", title: "Completed", icon: CheckCircle2, items: completed, accent: "text-emerald-500", barClass: "bg-emerald-500/40", dotClass: "bg-emerald-500", badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-background select-none">
      <header className="glass sticky top-0 z-30 border-b border-border/60">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
          <Link href="/" className="group flex items-center gap-2.5 whitespace-nowrap">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/55 shadow-sm shadow-primary/30 ring-1 ring-white/10 transition-transform group-hover:scale-105">
              <GitBranch className="size-4 text-primary-foreground" />
            </div>
            <span className="text-gradient hidden text-base font-bold tracking-tight sm:inline">
              Issue Finder
            </span>
          </Link>
          <span className="text-sm font-semibold text-muted-foreground">/ My Issues</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground cursor-pointer">
              <Link href="/my-repos">
                <span className="hidden sm:inline">My Repos</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground cursor-pointer">
              <Link href="/">
                <ArrowLeft className="size-3.5" />
                <span className="hidden sm:inline">Search</span>
              </Link>
            </Button>
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6">
        {status === "unauthenticated" ? (
          <StatePanel
            icon={LogIn}
            title="Sign in to see your issues"
            description="Save issues and mark them done to track your open-source contributions across devices."
          >
            <Button onClick={() => signIn("github")} className="gap-1.5 cursor-pointer">
              <GitBranch className="size-4" />
              Sign in with GitHub
            </Button>
          </StatePanel>
        ) : (
          <>
            {/* Header Title & View Toggle */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">My Issues</h1>
                <p className="text-sm text-muted-foreground leading-normal">
                  Your open-source contribution planner, saved bookmarks, and completed contributions.
                </p>
              </div>

              {/* Toggle View Mode & Detail */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <Button
                  variant={bulkMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setBulkMode(!bulkMode)
                    if (bulkMode) setSelectedIssueIds(new Set())
                  }}
                  title="Toggle bulk selection"
                  className="gap-1.5 text-muted-foreground cursor-pointer"
                >
                  <CheckSquare className="size-3.5" />
                  <span className="hidden sm:inline">Select</span>
                </Button>
                {bulkMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="gap-1.5 text-muted-foreground cursor-pointer"
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </Button>
                )}
                <div className="inline-flex items-center gap-1 rounded-xl bg-secondary/60 p-1 ring-1 ring-border/60">
                  <button
                    onClick={() => setViewMode("board")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                      viewMode === "board"
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Kanban className="size-3.5" />
                    Kanban Board
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                      viewMode === "list"
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List className="size-3.5" />
                    List View
                  </button>
                </div>
                <button
                  onClick={() => setDetailView((v) => !v)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer border",
                    detailView
                      ? "bg-background text-foreground shadow-sm border-border/60"
                      : "bg-secondary/60 text-muted-foreground hover:text-foreground border-transparent"
                  )}
                  title={detailView ? "Show minimal cards" : "Show full details"}
                >
                  {detailView ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {detailView ? "Minimal" : "Details"}
                </button>
              </div>
            </div>

            {loading ? (
              /* Loading Skeletons */
              viewMode === "board" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="space-y-3 rounded-2xl border border-border bg-card/50 p-4">
                      <Skeleton className="h-6 w-24 rounded-lg" />
                      <Skeleton className="h-32 rounded-xl" />
                      <Skeleton className="h-32 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-44 rounded-2xl" />
                  ))}
                </div>
              )
            ) : data && data.length === 0 ? (
              /* Empty State */
              <StatePanel
                icon={Bookmark}
                title="Your tracking board is empty"
                description="Bookmark issues from search results or matching recommendations to start planning your contributions."
              >
                <Button variant="outline" asChild className="cursor-pointer">
                  <Link href="/">Browse issues</Link>
                </Button>
              </StatePanel>
            ) : (
              <>
              {selectedIssueIds.size > 0 && bulkMode && (
                <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="size-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {selectedIssueIds.size} selected
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <ExportButton
                      items={selectedObjects as unknown as GitHubIssue[]}
                      filename={bulkExportFilename}
                    />
                    <Button variant="outline" size="sm" onClick={bulkMarkDone} className="cursor-pointer">
                      Mark Done
                    </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmBulkRemove(true)} className="cursor-pointer">
                    Remove
                  </Button>
                    <Button variant="ghost" size="sm" onClick={clearSelection} className="cursor-pointer">
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            {viewMode === "board" ? (
              /* Kanban Board View */
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 items-start select-none">
                {kanbanColumns.map((col) => {
                  const Icon = col.icon
                  return (
                    <div
                      key={col.id}
                      className="flex flex-col rounded-2xl border border-border/80 bg-card/30 shadow-sm shadow-foreground/[0.02] ring-1 ring-foreground/[0.03] backdrop-blur-sm max-h-[80vh] min-h-[500px] overflow-hidden"
                    >
                      {/* Color-coded accent bar */}
                      <div className={cn("h-1 shrink-0", col.barClass)} />

                      {/* Column Header */}
                      <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={cn("size-4 shrink-0", col.accent)} />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80 truncate">
                            {col.title}
                          </h3>
                        </div>
                        <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums shrink-0", col.badgeClass)}>
                          <span className={cn("size-1.5 rounded-full", col.dotClass)} />
                          {col.items.length}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="mx-4 border-t border-border/50" />

                      {/* Column Items */}
                      <div className="flex-1 overflow-y-auto space-y-3 px-3 py-3 min-h-[260px] scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
                        {col.items.length === 0 ? (
                          <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-4 text-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-muted/40">
                              <Plus className="size-4 text-muted-foreground/40" />
                            </div>
                            <span className="text-[11px] text-muted-foreground/40 font-medium leading-tight">
                              No issues yet
                            </span>
                          </div>
                        ) : (
                          <Stagger stagger={0.03} className="space-y-3">
                            {col.items.map((item: SavedIssue) => (
                              <StaggerItem key={item.id}>
                                <SavedIssueCard
                                  item={item}
                                  pending={pending}
                                  detailView={detailView}
                                  onToggleSaved={handleToggleSaved}
                                  onToggleDone={handleToggleDone}
                                  onRemove={(it) => setConfirmRemove(it)}
                                  selected={bulkMode ? selectedIssueIds.has(item.issueId) : undefined}
                                  onToggleSelect={bulkMode ? toggleSelectIssue : undefined}
                                />
                              </StaggerItem>
                            ))}
                          </Stagger>
                        )}
                      </div>

                      {/* Column footer with count */}
                      <div className="shrink-0 border-t border-border/40 px-4 py-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 font-medium">
                          <div className={cn("size-1.5 rounded-full", col.dotClass)} />
                          {col.items.length} {col.items.length === 1 ? "issue" : "issues"}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* List View (Original Tabs) */
              <div className="space-y-5">
                {/* Tabs selection */}
                <div className="inline-flex items-center gap-1 rounded-xl bg-secondary/60 p-1 ring-1 ring-border/60">
                  {tabs.map((t) => {
                    const Icon = t.icon
                    const active = tab === t.value
                    return (
                      <button
                        key={t.value}
                        onClick={() => setTab(t.value)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                          active
                            ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="size-4" />
                        {t.label}
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                            active
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {t.count}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {items.length === 0 ? (
                  <StatePanel
                    icon={tab === "saved" ? Bookmark : CheckCircle2}
                    title={tab === "saved" ? "No saved issues yet" : "Nothing marked done yet"}
                    description={
                      tab === "saved"
                        ? "Bookmark issues from search to find them here later."
                        : "Mark issues as done to track what you've contributed to."
                    }
                  >
                    <Button variant="outline" asChild className="cursor-pointer">
                      <Link href="/">Browse issues</Link>
                    </Button>
                  </StatePanel>
                ) : (
                  <Stagger stagger={0.04} className="grid gap-4 sm:grid-cols-2">
                    {items.map((item: SavedIssue) => (
                      <StaggerItem key={item.id} className="h-full">
                        <SavedIssueCard
                          item={item}
                          pending={pending}
                          detailView={detailView}
                          onToggleSaved={handleToggleSaved}
                          onToggleDone={handleToggleDone}
                          onRemove={(it) => setConfirmRemove(it)}
                          selected={bulkMode ? selectedIssueIds.has(item.issueId) : undefined}
                          onToggleSelect={bulkMode ? toggleSelectIssue : undefined}
                        />
                      </StaggerItem>
                    ))}
                  </Stagger>
                )}
              </div>
            )}
          </>
            )}
          </>
        )}
      </main>

      <ConfirmDialog
        open={!!confirmRemove}
        onOpenChange={(open) => { if (!open) setConfirmRemove(null) }}
        title="Remove issue?"
        description={
          confirmRemove
            ? `"#${confirmRemove.number} ${confirmRemove.title}" will be removed from your issues.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
        isLoading={remove.isPending}
      />
      <ConfirmDialog
        open={confirmBulkRemove}
        onOpenChange={setConfirmBulkRemove}
        title={`Remove ${selectedIssueIds.size} issues?`}
        description={`${selectedIssueIds.size} selected issue${selectedIssueIds.size === 1 ? " will" : "s will"} be removed from your saved issues.`}
        confirmLabel="Remove All"
        onConfirm={bulkRemove}
      />
    </div>
  )
}
