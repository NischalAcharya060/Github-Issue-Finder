"use client"

import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import { Clock, Trash2, Search } from "lucide-react"

interface RecentSearchesProps {
  onSelect: (query: string) => void
}

export function RecentSearches({ onSelect }: RecentSearchesProps) {
  const [searches, , clearSearches] = useLocalStorage<string[]>(
    "recent-searches",
    []
  )

  if (searches.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex size-6 items-center justify-center rounded-lg bg-muted ring-1 ring-border/70">
            <Clock className="size-3.5 text-muted-foreground" />
          </div>
          Recent Searches
        </div>
        <p className="text-xs text-muted-foreground">
          No recent searches yet
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex size-6 items-center justify-center rounded-lg bg-muted ring-1 ring-border/70">
            <Clock className="size-3.5 text-muted-foreground" />
          </div>
          Recent Searches
        </div>
        <Button
          variant="ghost"
          size="xs"
          onClick={clearSearches}
          className="gap-1 text-xs"
        >
          <Trash2 className="size-3" />
          Clear
        </Button>
      </div>
      <div className="space-y-1">
        {searches.slice(0, 8).map((query) => (
          <Button
            key={query}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
            onClick={() => onSelect(query)}
          >
            <Search className="size-3 shrink-0" />
            <span className="truncate">{query}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
