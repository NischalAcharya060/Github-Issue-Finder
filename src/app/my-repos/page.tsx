"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useSession, signIn } from "next-auth/react"
import { toast } from "sonner"
import { GitBranch, Bookmark, LogIn, ArrowLeft, Star, GitFork, ExternalLink, Trash2, ChevronRight, CheckSquare, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { AuthButton } from "@/components/auth/auth-button"
import { StatePanel } from "@/components/shared/state-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { Stagger, StaggerItem } from "@/components/motion/motion-primitives"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { RepoIssuesModal } from "@/components/repos/repo-issues-modal"
import { useSavedRepos, useToggleSaveRepo } from "@/hooks/use-saved-repos"
import { getRepoIssues } from "@/lib/github-api"
import type { SavedRepo, GitHubIssue, GitHubRepo } from "@/lib/types"

export default function MyReposPage() {
  const { status } = useSession()
  const { data, isLoading } = useSavedRepos()
  const toggle = useToggleSaveRepo()
  const loading = isLoading || status === "loading"

  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [repoIssues, setRepoIssues] = useState<GitHubIssue[] | null>(null)
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [issuesError, setIssuesError] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<SavedRepo | null>(null)
  const [confirmBulkRemoveRepos, setConfirmBulkRemoveRepos] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<string>>(new Set())

  const allRepos = data ?? []

  const toggleSelectRepo = useCallback((repoFullName: string) => {
    setSelectedRepoIds((prev) => {
      const next = new Set(prev)
      if (next.has(repoFullName)) next.delete(repoFullName)
      else next.add(repoFullName)
      return next
    })
  }, [])

  const allRepoIds = allRepos.map((r) => r.repoFullName)
  const allReposSelected = allRepoIds.length > 0 && allRepoIds.every((id) => selectedRepoIds.has(id))

  const toggleSelectAllRepos = useCallback(() => {
    if (allReposSelected) {
      setSelectedRepoIds(new Set())
    } else {
      setSelectedRepoIds(new Set(allRepoIds))
    }
  }, [allReposSelected, allRepoIds])

  const clearRepoSelection = useCallback(() => {
    setSelectedRepoIds(new Set())
    setBulkMode(false)
  }, [])

  const selectedRepoObjects = allRepos.filter((r) => selectedRepoIds.has(r.repoFullName))

  const bulkRemoveRepos = () => {
    selectedRepoObjects.forEach((item) => {
      toggle.mutate({
        repo: {
          id: 0,
          name: item.name,
          full_name: item.repoFullName,
          html_url: item.htmlUrl,
          description: item.description,
          language: item.language,
          stargazers_count: item.stargazersCount,
          forks_count: item.forksCount,
          owner: { login: item.owner, id: 0, avatar_url: "", html_url: "" },
        },
        saved: false,
      })
    })
    setSelectedRepoIds(new Set())
    setConfirmBulkRemoveRepos(false)
  }

  const bulkExportRepos = () => {
    const headers = ["Name", "Owner", "URL", "Description", "Language", "Stars", "Forks"]
    const rows = selectedRepoObjects.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.owner.replace(/"/g, '""')}"`,
      r.htmlUrl,
      `"${(r.description ?? "").replace(/"/g, '""')}"`,
      r.language ?? "",
      r.stargazersCount.toString(),
      r.forksCount.toString(),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `saved-repos-${selectedRepoObjects.length}-selected.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleConfirmDelete = () => {
    if (!confirmDelete) return
    toggle.mutate(
      {
        repo: {
          id: 0,
          name: confirmDelete.name,
          full_name: confirmDelete.repoFullName,
          html_url: confirmDelete.htmlUrl,
          description: confirmDelete.description,
          language: confirmDelete.language,
          stargazers_count: confirmDelete.stargazersCount,
          forks_count: confirmDelete.forksCount,
          owner: { login: confirmDelete.owner, id: 0, avatar_url: "", html_url: "" },
        },
        saved: false,
      },
      {
        onSuccess: () => {
          toast.success("Repository removed", {
            description: `${confirmDelete.repoFullName} has been removed from your saved repos.`,
          })
          setConfirmDelete(null)
        },
        onError: () => {
          toast.error("Failed to remove repository", {
            description: "Something went wrong. Please try again.",
          })
        },
      }
    )
  }

  const handleRepoClick = async (item: SavedRepo) => {
    const repo: GitHubRepo = {
      id: 0,
      name: item.name,
      full_name: item.repoFullName,
      html_url: item.htmlUrl,
      description: item.description,
      language: item.language,
      stargazers_count: item.stargazersCount,
      forks_count: item.forksCount,
      owner: { login: item.owner, id: 0, avatar_url: "", html_url: "" },
    }
    setSelectedRepo(repo)
    setRepoIssues(null)
    setIssuesLoading(true)
    setIssuesError(false)
    try {
      const issues = await getRepoIssues(item.owner, item.name)
      setRepoIssues(issues)
    } catch {
      setIssuesError(true)
    } finally {
      setIssuesLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
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
          <span className="text-sm font-semibold text-muted-foreground">/ My Repos</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground cursor-pointer">
              <Link href="/my-issues">
                <span className="hidden sm:inline">My Issues</span>
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
            title="Sign in to see your saved repos"
            description="Save repositories to quickly find them later."
          >
            <Button onClick={() => signIn("github")} className="gap-1.5 cursor-pointer">
              <GitBranch className="size-4" />
              Sign in with GitHub
            </Button>
          </StatePanel>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">My Repos</h1>
                <p className="text-sm text-muted-foreground leading-normal">
                  Your saved repositories for quick access. Click a repo to browse its open issues.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={bulkMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setBulkMode(!bulkMode)
                    if (bulkMode) setSelectedRepoIds(new Set())
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
                    onClick={toggleSelectAllRepos}
                    className="gap-1.5 text-muted-foreground cursor-pointer"
                  >
                    {allReposSelected ? "Deselect All" : "Select All"}
                  </Button>
                )}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {data ? `${data.length} saved` : ""}
                </span>
              </div>
            </div>

            {selectedRepoIds.size > 0 && bulkMode ? (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={allReposSelected}
                  onChange={toggleSelectAllRepos}
                  className="size-4 rounded border-border accent-primary cursor-pointer"
                />
                <span className="text-sm font-medium text-foreground">
                  {selectedRepoIds.size} selected
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={bulkExportRepos} className="gap-1.5 cursor-pointer">
                    <Download className="size-3.5" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmBulkRemoveRepos(true)} className="cursor-pointer">
                    Remove
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearRepoSelection} className="cursor-pointer">
                    Clear
                  </Button>
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))}
              </div>
            ) : !data || data.length === 0 ? (
              <StatePanel
                icon={Bookmark}
                title="No saved repos yet"
                description="Save repositories from search results to find them here."
              >
                <Button variant="outline" asChild className="cursor-pointer">
                  <Link href="/">Browse on home</Link>
                </Button>
              </StatePanel>
            ) : (
              <Stagger stagger={0.04} className="grid gap-4 sm:grid-cols-2">
                {data.map((item: SavedRepo) => {
                  const isRemoving = toggle.isPending && toggle.variables?.repo.full_name === item.repoFullName && !toggle.variables?.saved
                  return (
                    <StaggerItem key={item.id} className="h-full">
                      <SavedRepoCard
                        item={item}
                        onClick={() => handleRepoClick(item)}
                        onRemove={() => setConfirmDelete(item)}
                        isRemoving={isRemoving}
                        selected={bulkMode ? selectedRepoIds.has(item.repoFullName) : undefined}
                        onToggleSelect={bulkMode ? toggleSelectRepo : undefined}
                      />
                    </StaggerItem>
                  )
                })}
              </Stagger>
            )}
          </>
        )}
      </main>

      {selectedRepo && (
        <RepoIssuesModal
          repo={selectedRepo}
          issues={repoIssues}
          isLoading={issuesLoading}
          isError={issuesError}
          onClose={() => setSelectedRepo(null)}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => { if (!open) setConfirmDelete(null) }}
        title="Remove repository?"
        description={
          confirmDelete
            ? `"${confirmDelete.repoFullName}" will be removed from your saved repos.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={handleConfirmDelete}
        isLoading={toggle.isPending}
      />
      <ConfirmDialog
        open={confirmBulkRemoveRepos}
        onOpenChange={setConfirmBulkRemoveRepos}
        title={`Remove ${selectedRepoIds.size} repositor${selectedRepoIds.size === 1 ? "y" : "ies"}?`}
        description={`${selectedRepoIds.size} selected ${selectedRepoIds.size === 1 ? "repo will" : "repos will"} be removed from your saved repos.`}
        confirmLabel="Remove All"
        onConfirm={bulkRemoveRepos}
      />
    </div>
  )
}

interface SavedRepoCardProps {
  item: SavedRepo
  onClick: () => void
  onRemove: () => void
  isRemoving?: boolean
  selected?: boolean
  onToggleSelect?: (repoFullName: string) => void
}

function SavedRepoCard({ item, onClick, onRemove, isRemoving, selected, onToggleSelect }: SavedRepoCardProps) {
  return (
    <div className="group relative h-full">
      <div className="card-glow absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col rounded-2xl border border-border/70 bg-card shadow-sm shadow-foreground/[0.03] ring-1 ring-foreground/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/8">
        <button
          onClick={onClick}
          className="flex w-full cursor-pointer flex-col p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset rounded-t-2xl"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {onToggleSelect && (
                <input
                  type="checkbox"
                  checked={!!selected}
                  onChange={() => onToggleSelect(item.repoFullName)}
                  className="size-4 rounded border-border accent-primary cursor-pointer shrink-0"
                />
              )}
              <span className="text-sm font-semibold text-card-foreground transition-colors group-hover:text-primary truncate">
                {item.repoFullName}
              </span>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

          {item.description && (
            <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground text-left">
              {item.description}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
            {item.language && (
              <span className="flex items-center gap-1.5 font-medium">
                <span className="size-2 rounded-full bg-primary" />
                {item.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="size-3" />
              {item.stargazersCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="size-3" />
              {item.forksCount.toLocaleString()}
            </span>
          </div>
        </button>

        <div className="border-t border-border/50 px-4 py-2 flex items-center justify-between">
          <button
            onClick={onRemove}
            disabled={isRemoving}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            <Trash2 className="size-3" />
            Remove
          </button>
          <Link
            href={item.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="size-3" />
            Open
          </Link>
        </div>
      </div>
    </div>
  )
}
