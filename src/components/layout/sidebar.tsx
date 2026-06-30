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
    <div className="sticky top-20">
      <div className="rounded-2xl border border-border/70 bg-card/60 shadow-sm shadow-foreground/[0.03] ring-1 ring-foreground/[0.04] backdrop-blur-sm max-h-[calc(100vh-7.5rem)] overflow-y-auto scrollbar-thin">
        <FilterPanel filters={filters} onChange={onFiltersChange} />
        <div className="border-t border-border/50" />
        <RecentSearches onSelect={onSelectRecentSearch} />
      </div>
    </div>
  )
}
