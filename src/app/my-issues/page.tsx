"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSession, signIn } from "next-auth/react"
import { GitBranch, Bookmark, CheckCircle2, LogIn, ArrowLeft } from "lucide-react"
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

export default function MyIssuesPage() {
  const { status } = useSession()
  const [tab, setTab] = useState<Tab>("saved")
  const { data, isLoading } = useSavedIssues("all")
  const patch = usePatchSavedIssue()
  const remove = useRemoveSavedIssue()

  const pending = patch.isPending || remove.isPending

  const { saved, done } = useMemo(() => {
    const all = data ?? []
    return {
      saved: all.filter((i) => i.saved),
      done: all.filter((i) => i.done),
    }
  }, [data])

  const items = tab === "saved" ? saved : done
  const loading = isLoading || status === "loading"

  const tabs: { value: Tab; label: string; icon: typeof Bookmark; count: number }[] = [
    { value: "saved", label: "Saved", icon: Bookmark, count: saved.length },
    { value: "done", label: "Done", icon: CheckCircle2, count: done.length },
  ]

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="glass sticky top-0 z-30 border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
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
            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground">
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

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-6">
        {status === "unauthenticated" ? (
          <StatePanel
            icon={LogIn}
            title="Sign in to see your issues"
            description="Save issues and mark them done to track your open-source contributions across devices."
          >
            <Button onClick={() => signIn("github")} className="gap-1.5">
              <GitBranch className="size-4" />
              Sign in with GitHub
            </Button>
          </StatePanel>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">My Issues</h1>
              <p className="text-sm text-muted-foreground">
                Issues you&apos;ve bookmarked and contributions you&apos;ve marked done.
              </p>
            </div>

            {/* Tabs with counts */}
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
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
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

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <StatePanel
                icon={tab === "saved" ? Bookmark : CheckCircle2}
                title={tab === "saved" ? "No saved issues yet" : "Nothing marked done yet"}
                description={
                  tab === "saved"
                    ? "Bookmark issues from search to find them here later."
                    : "Mark issues as done to track what you've contributed to."
                }
              >
                <Button variant="outline" asChild>
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
          </>
        )}
      </main>
    </div>
  )
}
