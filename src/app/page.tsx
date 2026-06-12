"use client"

import { useState, useCallback } from "react"
import { SearchBar } from "@/components/search/search-bar"
import { FilterPanel } from "@/components/search/filter-panel"
import { SortDropdown } from "@/components/search/sort-dropdown"
import { IssueList } from "@/components/issues/issue-list"
import { Pagination } from "@/components/shared/pagination"
import { useGithubSearch } from "@/hooks/use-github-search"
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

  const { data, isLoading, isError } = useGithubSearch(
    keyword,
    searchMode,
    filters,
    sort,
    page
  )

  const handleSearch = useCallback((value: string) => {
    setKeyword(value)
    setPage(1)
  }, [])

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  const totalPages = data
    ? Math.min(Math.ceil(data.total_count / 30), 100)
    : 0

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <h1 className="text-lg font-semibold whitespace-nowrap">
            Issue Finder
          </h1>
          <div className="flex-1">
            <SearchBar
              value={keyword}
              onChange={handleSearch}
              mode={searchMode}
              onModeChange={setSearchMode}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border p-4">
            <FilterPanel
              filters={filters}
              onChange={handleFiltersChange}
            />
          </div>
        </aside>

        <main className="flex-1 space-y-4">
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
        </main>
      </div>
    </div>
  )
}
