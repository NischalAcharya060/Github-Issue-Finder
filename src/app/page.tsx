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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useGithubSearch } from "@/hooks/use-github-search"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useDebounce } from "@/hooks/use-debounce"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { useHotkey } from "@/hooks/use-hotkey"
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
  const [, setSavedSearches] = useLocalStorage<
    { name: string; query: string; filters: FilterState }[]
  >("saved-searches", [])
  const [, setRecentSearches] = useLocalStorage<string[]>("recent-searches", [])

  const debouncedKeyword = useDebounce(keyword, 400)

  const { data, isLoading, isError } = useGithubSearch(
    debouncedKeyword,
    searchMode,
    entityType,
    filters,
    sort,
    page
  )

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
          {!keyword && !data ? (
            <Welcome onSearch={handleSearch} />
          ) : (
            <>
              {entityType === "issues" && (
                <StatsCards data={data as SearchResponse | undefined} isLoading={isLoading} />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    {data && (
                      <span>
                        {(data as SearchResponse | RepoSearchResponse).total_count.toLocaleString()} results found
                      </span>
                    )}
                  </div>
                  {keyword && entityType === "issues" && (
                    <ExportButton
                      data={data as SearchResponse | undefined}
                      filename={`github-issues-${keyword.replace(/\s+/g, "-")}`}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveSearch}
                    className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    title="Save this search"
                  >
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    Save
                  </button>
                  <SortDropdown value={sort} onChange={setSort} />
                </div>
              </div>

              {entityType === "issues" ? (
                <IssueList
                  issues={(data as SearchResponse | undefined)?.items}
                  isLoading={isLoading}
                  isError={isError}
                  totalCount={(data as SearchResponse | undefined)?.total_count ?? 0}
                  onIssueClick={setSelectedIssue}
                />
              ) : entityType === "repositories" ? (
                <RepoList
                  data={data as RepoSearchResponse | undefined}
                  isLoading={isLoading}
                  isError={isError}
                />
              ) : (
                <IssueList
                  issues={(data as SearchResponse | undefined)?.items}
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
        issues={(data as SearchResponse | undefined)?.items ?? []}
        onClose={() => setSelectedIssue(null)}
      />
    </div>
  )
}
