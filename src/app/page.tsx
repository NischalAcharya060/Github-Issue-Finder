"use client"

import { useState, useCallback } from "react"
import { FilterPanel } from "@/components/search/filter-panel"
import { SortDropdown } from "@/components/search/sort-dropdown"
import { IssueList } from "@/components/issues/issue-list"
import { Pagination } from "@/components/shared/pagination"
import { Welcome } from "@/components/shared/welcome"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RepoList } from "@/components/repos/repo-list"
import { IssueDetailModal } from "@/components/issues/issue-detail-modal"
import { ExportButton } from "@/components/shared/export-button"
import { Button } from "@/components/ui/button"
import { Bookmark, BarChart3 } from "lucide-react"
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
import { useHotkey } from "@/hooks/use-hotkey"
import { ForYouFeed } from "@/components/dashboard/for-you-feed"
import { SearchAnalytics } from "@/components/dashboard/search-analytics"
import type { SearchMode, FilterState, SortOption, EntityType, SearchResponse, RepoSearchResponse } from "@/lib/types"

const defaultFilters: FilterState = {
  language: "all",
  labels: [],
  state: "all",
  createdYear: "all",
  updatedYear: "all",
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
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [, setSavedSearches] = useLocalStorage<
    { name: string; query: string; filters: FilterState }[]
  >("saved-searches", [])
  const [, setRecentSearches] = useLocalStorage<string[]>("recent-searches", [])

  const debouncedKeyword = useDebounce(keyword, 400)

  const { isIgnored } = useIgnoredRepos()

  const { data, isLoading, isError } = useGithubSearch(
    debouncedKeyword,
    searchMode,
    entityType,
    filters,
    sort,
    page
  )

  const filteredIssues = (data as SearchResponse | undefined)?.items?.filter(
    (issue) => !isIgnored(issue.repository_url.replace("https://api.github.com/repos/", ""))
  )
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

  const handleSaveSearch = useCallback(() => {
    const name = `Search "${keyword}"`
    setSavedSearches((prev) => {
      const next = [{ name, query: keyword, filters }, ...prev]
      return next.slice(0, 20)
    })
  }, [keyword, filters, setSavedSearches])

  const totalPages = data
    ? Math.min(Math.ceil((data as SearchResponse | RepoSearchResponse).total_count / 30), 100)
    : 0

  useKeyboardShortcut("Escape", () => setSelectedIssue(null))

  const focusSearch = useCallback(() => {
    document.getElementById("search-input")?.focus()
  }, [])

  useHotkey("k", focusSearch, { metaKey: true })
  useHotkey("k", focusSearch, { ctrlKey: true })

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
        <aside className="hidden w-64 shrink-0 lg:block">
          <Sidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSelectRecentSearch={handleSelectRecentSearch}
          />
        </aside>

        <main id="main-content" className="flex-1 space-y-6">
          {entityType === "foryou" ? (
            <ForYouFeed onIssueClick={setSelectedIssue} />
          ) : !keyword && !data ? (
            <Welcome onSearch={handleSearch} />
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
                  {keyword && entityType === "issues" && (
                    <ExportButton
                      data={data as SearchResponse | undefined}
                      filename={`github-issues-${keyword.replace(/\s+/g, "-")}`}
                    />
                  )}
                  {keyword && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveSearch}
                      title="Save this search"
                      className="gap-1.5 text-muted-foreground cursor-pointer"
                    >
                      <Bookmark className="size-3.5" />
                      <span className="hidden sm:inline">Save</span>
                    </Button>
                  )}
                  <SortDropdown value={sort} onChange={setSort} />
                </div>
              </div>

              {showAnalytics && data && entityType === "issues" && filteredIssues && filteredIssues.length > 0 && (
                <SearchAnalytics issues={filteredIssues} />
              )}

              {entityType === "issues" ? (
                <IssueList
                  issues={filteredIssues}
                  isLoading={isLoading}
                  isError={isError}
                  totalCount={(data as SearchResponse | undefined)?.total_count ?? 0}
                  onIssueClick={setSelectedIssue}
                />
              ) : entityType === "repositories" ? (
                <RepoList
                  data={filteredRepoData}
                  isLoading={isLoading}
                  isError={isError}
                />
              ) : (
                <IssueList
                  issues={filteredIssues}
                  isLoading={isLoading}
                  isError={isError}
                  totalCount={(data as SearchResponse | undefined)?.total_count ?? 0}
                  onIssueClick={setSelectedIssue}
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
    </div>
  )
}
