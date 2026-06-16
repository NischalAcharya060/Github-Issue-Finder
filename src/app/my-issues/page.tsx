"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSession, signIn } from "next-auth/react"
import { GitBranch, Bookmark, CheckCircle2, LogIn, ArrowLeft, Kanban, List, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { AuthButton } from "@/components/auth/auth-button"
import { StatePanel } from "@/components/shared/state-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { SavedIssueCard } from "@/components/issues/saved-issue-card"
import { Stagger, StaggerItem } from "@/components/motion/motion-primitives"
import { cn } from "@/lib/utils"
import {
  useSavedIssues,
  usePatchSavedIssue,
  useRemoveSavedIssue,
} from "@/hooks/use-saved-issues"
import type { SavedIssue } from "@/lib/types"

type Tab = "saved" | "done"
type ViewMode = "board" | "list"

export default function MyIssuesPage() {
  const { status } = useSession()
  const [tab, setTab] = useState<Tab>("saved")
  const [viewMode, setViewMode] = useState<ViewMode>("board")
  const { data, isLoading } = useSavedIssues("all")
  const patch = usePatchSavedIssue()
  const remove = useRemoveSavedIssue()

  const pending = patch.isPending || remove.isPending

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
    { id: "BACKLOG", title: "Saved (Backlog)", icon: "📋", items: backlog, borderClass: "border-t-muted-foreground/30", bgAccent: "bg-muted/10" },
    { id: "IN_PROGRESS", title: "In Progress", icon: "⚡", items: inProgress, borderClass: "border-t-amber-500/40", bgAccent: "bg-amber-500/[0.01]" },
    { id: "IN_REVIEW", title: "In Review", icon: "🔍", items: inReview, borderClass: "border-t-blue-500/40", bgAccent: "bg-blue-500/[0.01]" },
    { id: "DONE", title: "Completed", icon: "🎉", items: completed, borderClass: "border-t-emerald-500/40", bgAccent: "bg-emerald-500/[0.01]" },
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

              {/* Toggle View Mode */}
              <div className="inline-flex items-center gap-1 rounded-xl bg-secondary/60 p-1 ring-1 ring-border/60 shrink-0 self-start sm:self-auto">
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
            ) : viewMode === "board" ? (
              /* Kanban Board View */
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 items-start select-none">
                {kanbanColumns.map((col) => (
                  <div
                    key={col.id}
                    className={cn(
                      "flex flex-col rounded-2xl border border-border/80 p-3.5 shadow-sm max-h-[80vh] min-h-[500px]",
                      col.bgAccent
                    )}
                  >
                    {/* Column Header */}
                    <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <span className="text-sm">{col.icon}</span>
                        {col.title}
                      </span>
                      <span className="rounded-full bg-secondary/80 border px-2 py-0.5 text-[10px] font-bold tabular-nums">
                        {col.items.length}
                      </span>
                    </div>

                    {/* Column Items */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px]">
                      {col.items.length === 0 ? (
                        <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-4 text-center">
                          <AlertCircle className="size-4.5 text-muted-foreground/30 mb-2" />
                          <span className="text-[10px] text-muted-foreground/50 font-medium">No issues in this stage</span>
                        </div>
                      ) : (
                        <Stagger stagger={0.03} className="space-y-4">
                          {col.items.map((item: SavedIssue) => (
                            <StaggerItem key={item.id}>
                              <SavedIssueCard
                                item={item}
                                pending={pending}
                                onToggleSaved={(it) =>
                                  patch.mutate({ issueId: it.issueId, saved: !it.saved })
                                }
                                onToggleDone={(it) =>
                                  patch.mutate({ issueId: it.issueId, done: !it.done })
                                }
                                onRemove={(it) => remove.mutate(it.issueId)}
                              />
                            </StaggerItem>
                          ))}
                        </Stagger>
                      )}
                    </div>
                  </div>
                ))}
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
                          onToggleSaved={(it) =>
                            patch.mutate({ issueId: it.issueId, saved: !it.saved })
                          }
                          onToggleDone={(it) =>
                            patch.mutate({ issueId: it.issueId, done: !it.done })
                          }
                          onRemove={(it) => remove.mutate(it.issueId)}
                        />
                      </StaggerItem>
                    ))}
                  </Stagger>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
