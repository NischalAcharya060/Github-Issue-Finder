"use client"

import { useState, useCallback } from "react"
import { FilterPanel } from "@/components/search/filter-panel"
import { SortDropdown } from "@/components/search/sort-dropdown"
import { IssueList } from "@/components/issues/issue-list"
import { Pagination } from "@/components/shared/pagination"
import { Welcome } from "@/components/shared/welcome"
import { Navbar } from "@/components/layout/navbar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useGithubSearch } from "@/hooks/use-github-search"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { SearchMode, FilterState, SortOption } from "@/lib/types"

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
  const [keyword, setKeyword] = useState("")
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [sort, setSort] = useState<SortOption>("created-desc")
  const [page, setPage] = useState(1)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [, setRecentSearches] = useLocalStorage<string[]>("recent-searches", [])

  const { data, isLoading, isError } = useGithubSearch(
    keyword,
    searchMode,
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

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  const totalPages = data
    ? Math.min(Math.ceil(data.total_count / 30), 100)
    : 0

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar
        keyword={keyword}
        onSearch={handleSearch}
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        onMobileMenuOpen={() => setMobileSheetOpen(true)}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-xl border p-4">
              <FilterPanel
                filters={filters}
                onChange={handleFiltersChange}
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          {!keyword && !data ? (
            <Welcome onSearch={handleSearch} />
          ) : (
            <>
              <StatsCards data={data} isLoading={isLoading} />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {data && (
                    <span>
                      {data.total_count.toLocaleString()} issues found
                    </span>
                  )}
                </div>
                <SortDropdown value={sort} onChange={setSort} />
              </div>

              <IssueList
                issues={data?.items}
                isLoading={isLoading}
                isError={isError}
                totalCount={data?.total_count ?? 0}
              />

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalCount={data?.total_count ?? 0}
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
    </div>
  )
}
