"use client"

import { FilterPanel } from "@/components/search/filter-panel"
import { RecentSearches } from "@/components/dashboard/recent-searches"
import type { FilterState } from "@/lib/types"

interface SidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onSelectRecentSearch: (query: string) => void
}

export function Sidebar({
  filters,
  onFiltersChange,
  onSelectRecentSearch,
}: SidebarProps) {
  return (
    <div className="sticky top-20 space-y-4">
      <div className="rounded-xl border p-4">
        <FilterPanel filters={filters} onChange={onFiltersChange} />
      </div>
      <div className="rounded-xl border p-4">
        <RecentSearches onSelect={onSelectRecentSearch} />
      </div>
    </div>
  )
}
