"use client"

import { useState, useCallback, useEffect } from "react"
import { FilterPanel } from "@/components/search/filter-panel"
import { SortDropdown } from "@/components/search/sort-dropdown"
import { IssueList } from "@/components/issues/issue-list"
import { Pagination } from "@/components/shared/pagination"
import { Welcome } from "@/components/shared/welcome"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RepoList } from "@/components/repos/repo-list"
import { RepoIssuesModal } from "@/components/repos/repo-issues-modal"
import { IssueDetailModal } from "@/components/issues/issue-detail-modal"
import { getRepoIssues } from "@/lib/github-api"
import { getRepoFromUrl } from "@/lib/utils"
import { ExportButton } from "@/components/shared/export-button"
import { KeyboardShortcutsModal } from "@/components/shared/keyboard-shortcuts-modal"
import { FaqSection } from "@/components/shared/faq-section"
import { HowToSection } from "@/components/shared/how-to-section"
import { Button } from "@/components/ui/button"
import { BarChart3, CheckSquare } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useGithubSearch } from "@/hooks/use-github-search"
import { useIgnoredRepos } from "@/hooks/use-ignored-repos"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useDebounce } from "@/hooks/use-debounce"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { ForYouFeed } from "@/components/dashboard/for-you-feed"
import { TrendingFeed } from "@/components/dashboard/trending-feed"
import { SearchAnalytics } from "@/components/dashboard/search-analytics"
import type { SearchMode, FilterState, SortOption, EntityType, SearchResponse, RepoSearchResponse, GitHubIssue, GitHubRepo } from "@/lib/types"

const defaultFilters: FilterState = {
  language: "all",
  labels: [],
  state: "all",
  createdFrom: "",
  createdTo: "",
  updatedFrom: "",
  updatedTo: "",
  minStars: "",
  maxStars: "",
  beginnerFriendly: false,
  goodFirstIssue: false,
  helpWanted: false,
}

export default function Home() {
  const [searchMode, setSearchMode] = useState<SearchMode>("keyword")
  const [entityType, setEntityType] = useState<EntityType>("issues")
  const [keyword, setKeyword] = useState("")
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [sort, setSort] = useState<SortOption>("created-desc")
  const [page, setPage] = useState(1)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null)
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [repoIssues, setRepoIssues] = useState<GitHubIssue[] | null>(null)
  const [repoIssuesLoading, setRepoIssuesLoading] = useState(false)
  const [repoIssuesError, setRepoIssuesError] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const [, setRecentSearches] = useLocalStorage<string[]>("recent-searches", [])

  const debouncedKeyword = useDebounce(keyword, 400)

  const { isIgnored, addIgnoredRepo } = useIgnoredRepos()

  const { data, isLoading, isError } = useGithubSearch(
    debouncedKeyword,
    searchMode,
    entityType,
    filters,
    sort,
    page
  )

  const filteredIssues = entityType !== "repositories"
    ? (data as SearchResponse | undefined)?.items?.filter(
        (issue) => !isIgnored(getRepoFromUrl(issue.repository_url))
      )
    : undefined
  const filteredRepoData = data && entityType === "repositories"
    ? { ...(data as RepoSearchResponse), items: (data as RepoSearchResponse).items.filter((r) => !isIgnored(r.full_name)) }
    : (data as RepoSearchResponse | undefined)


  const handleSearch = useCallback(
    (value: string) => {
      setKeyword(value)
      setPage(1)
      if (value.trim()) {
        setRecentSearches((prev) => {
          const next = [value, ...prev.filter((s) => s !== value)]
          return next.slice(0, 20)
        })
      }
    },
    [setRecentSearches]
  )

  const handleInputChange = useCallback((value: string) => {
    setKeyword(value)
    setPage(1)
  }, [])

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  const handleSelectRecentSearch = useCallback((query: string) => {
    setKeyword(query)
    setPage(1)
  }, [])

  const handleRepoClick = useCallback(
    async (repo: GitHubRepo) => {
      setSelectedRepo(repo)
      setRepoIssues(null)
      setRepoIssuesLoading(true)
      setRepoIssuesError(false)
      try {
        const issues = await getRepoIssues(repo.owner.login, repo.name)
        setRepoIssues(issues)
      } catch {
        setRepoIssuesError(true)
      } finally {
        setRepoIssuesLoading(false)
      }
    },
    []
  )

  const totalPages = data
    ? Math.min(Math.ceil((data as SearchResponse | RepoSearchResponse).total_count / 30), 100)
    : 0

  const selectedIssueObjects = (filteredIssues ?? []).filter((i) => selectedIssues.has(i.id))

  const toggleSelectIssue = useCallback((id: number) => {
    setSelectedIssues((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIssues(new Set())
    setBulkMode(false)
  }, [])

  const bulkExportFilename = selectedIssueObjects.length > 0
    ? `github-issues-${keyword.replace(/\s+/g, "-")}-selected`
    : "github-issues-selected"

  const bulkIgnoreRepos = () => {
    selectedIssueObjects.forEach((issue) => {
      addIgnoredRepo(getRepoFromUrl(issue.repository_url))
    })
    clearSelection()
  }

  const bulkSaveAll = async () => {
    for (const issue of selectedIssueObjects) {
      try {
        await fetch("/api/saved-issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issueId: issue.id,
            number: issue.number,
            title: issue.title,
            htmlUrl: issue.html_url,
            repoFullName: getRepoFromUrl(issue.repository_url),
            state: issue.state,
            labels: issue.labels.map((l) => ({ name: l.name, color: l.color })),
            saved: true,
          }),
        })
      } catch {
        // silently skip failures
      }
    }
    clearSelection()
  }

  const allFilteredIds = (filteredIssues ?? []).map((i) => i.id)
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIssues.has(id))

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      clearSelection()
    } else {
      setSelectedIssues(new Set(allFilteredIds))
    }
  }, [allSelected, allFilteredIds, clearSelection])

  useKeyboardShortcut("Escape", () => setSelectedIssue(null))

  const focusSearch = useCallback(() => {
    document.getElementById("search-input")?.focus()
  }, [])

  useKeyboardShortcut("k", focusSearch, { metaKey: true })
  useKeyboardShortcut("k", focusSearch, { ctrlKey: true })
  useKeyboardShortcut("?", () => setShowShortcuts(true))

  useEffect(() => {
    document.title = keyword
      ? `${keyword} — Issue Finder`
      : "Issue Finder — Discover GitHub issues worth contributing to"
  }, [keyword])

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar
        keyword={keyword}
        onSearch={handleInputChange}
        onSubmit={handleSearch}
        searchMode={searchMode}
        entityType={entityType}
        onSearchModeChange={setSearchMode}
        onEntityTypeChange={setEntityType}
        onMobileMenuOpen={() => setMobileSheetOpen(true)}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        {entityType !== "foryou" && entityType !== "trending" && (
          <aside className="hidden w-64 shrink-0 lg:block">
            <Sidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSelectRecentSearch={handleSelectRecentSearch}
            />
          </aside>
        )}

        <main id="main-content" className="flex-1 space-y-6">
          {entityType === "foryou" ? (
            <ForYouFeed onIssueClick={setSelectedIssue} />
          ) : entityType === "trending" ? (
            <TrendingFeed onIssueClick={setSelectedIssue} />
          ) : !keyword && !data ? (
            <>
              <Welcome onSearch={handleSearch} />
              <HowToSection />
              <FaqSection />
            </>
          ) : (
            <>
              {entityType === "issues" && (
                <StatsCards data={data as SearchResponse | undefined} isLoading={isLoading} />
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/60 px-4 py-2.5 shadow-sm shadow-foreground/[0.03] backdrop-blur-sm">
                <div className="flex items-center gap-3 text-sm">
                  {data ? (
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground tabular-nums">
                        {(data as SearchResponse | RepoSearchResponse).total_count.toLocaleString()}
                      </span>{" "}
                      results
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Searching…</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {keyword && entityType === "issues" && data && (data as SearchResponse).items?.length > 0 && (
                    <Button
                      variant={showAnalytics ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      title="Toggle Analytics Insights"
                      className="gap-1.5 text-muted-foreground cursor-pointer"
                    >
                      <BarChart3 className="size-3.5" />
                      <span className="hidden sm:inline">Insights</span>
                    </Button>
                  )}
                  {keyword && entityType === "issues" && !bulkMode && (
                    <ExportButton
                      data={data as SearchResponse | undefined}
                      filename={`github-issues-${keyword.replace(/\s+/g, "-")}`}
                    />
                  )}
                  {(entityType === "issues" || entityType === "organizations") && (
                    <>
                      <Button
                        variant={bulkMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setBulkMode(!bulkMode)
                          if (bulkMode) setSelectedIssues(new Set())
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
                    </>
                  )}
                  <SortDropdown value={sort} onChange={setSort} />
                </div>
              </div>

              {showAnalytics && data && entityType === "issues" && filteredIssues && filteredIssues.length > 0 && (
                <SearchAnalytics issues={filteredIssues} />
              )}

              {selectedIssues.size > 0 && (entityType === "issues" || entityType === "organizations") && (
                <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="size-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {selectedIssues.size} selected
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <ExportButton
                      items={selectedIssueObjects}
                      filename={bulkExportFilename}
                    />
                    <Button variant="outline" size="sm" onClick={bulkSaveAll} className="cursor-pointer">
                      Save All
                    </Button>
                    <Button variant="outline" size="sm" onClick={bulkIgnoreRepos} className="cursor-pointer">
                      Ignore Repos
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearSelection} className="cursor-pointer">
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {entityType === "issues" ? (
                <IssueList
                  issues={filteredIssues}
                  isLoading={isLoading}
                  isError={isError}
                  totalCount={(data as SearchResponse | undefined)?.total_count ?? 0}
                  onIssueClick={setSelectedIssue}
                  selectedIssues={bulkMode ? selectedIssues : undefined}
                  onToggleSelect={bulkMode ? toggleSelectIssue : undefined}
                />
              ) : entityType === "repositories" ? (
                <RepoList
                  data={filteredRepoData}
                  isLoading={isLoading}
                  isError={isError}
                  onRepoClick={handleRepoClick}
                />
              ) : (
                <IssueList
                  issues={filteredIssues}
                  isLoading={isLoading}
                  isError={isError}
                  totalCount={(data as SearchResponse | undefined)?.total_count ?? 0}
                  onIssueClick={setSelectedIssue}
                  selectedIssues={bulkMode ? selectedIssues : undefined}
                  onToggleSelect={bulkMode ? toggleSelectIssue : undefined}
                />
              )}

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalCount={(data as SearchResponse | RepoSearchResponse | undefined)?.total_count ?? 0}
                onPageChange={setPage}
              />
            </>
          )}
        </main>
      </div>

      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <FilterPanel
              filters={filters}
              onChange={(newFilters) => {
                handleFiltersChange(newFilters)
                setMobileSheetOpen(false)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <IssueDetailModal
        issueId={selectedIssue}
        issues={filteredIssues ?? []}
        onClose={() => setSelectedIssue(null)}
      />

      {selectedRepo && (
        <RepoIssuesModal
          repo={selectedRepo}
          issues={repoIssues}
          isLoading={repoIssuesLoading}
          isError={repoIssuesError}
          onClose={() => setSelectedRepo(null)}
        />
      )}

      <KeyboardShortcutsModal open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  )
}
