"use client"

import { FilterPanel } from "@/components/search/filter-panel"
import { RecentSearches } from "@/components/dashboard/recent-searches"
import { SavedSearches } from "@/components/dashboard/saved-searches"
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
      <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm shadow-foreground/[0.03] ring-1 ring-foreground/[0.04] backdrop-blur-sm">
        <FilterPanel filters={filters} onChange={onFiltersChange} />
      </div>
      <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm shadow-foreground/[0.03] ring-1 ring-foreground/[0.04] backdrop-blur-sm">
        <SavedSearches onSelect={onSelectRecentSearch} />
      </div>
      <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm shadow-foreground/[0.03] ring-1 ring-foreground/[0.04] backdrop-blur-sm">
        <RecentSearches onSelect={onSelectRecentSearch} />
      </div>
    </div>
  )
}
