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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex size-6 items-center justify-center rounded-lg bg-muted ring-1 ring-border/70">
            <Clock className="size-3.5 text-muted-foreground" />
          </div>
          Recent
        </div>
        {searches.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={clearSearches}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="size-3" />
            Clear
          </Button>
        )}
      </div>
      <div className="mt-3">
        {searches.length === 0 ? (
          <p className="text-xs text-muted-foreground">No recent searches yet</p>
        ) : (
          <div className="space-y-0.5">
            {searches.slice(0, 8).map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => onSelect(query)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground cursor-pointer"
              >
                <Search className="size-3 shrink-0" />
                <span className="truncate">{query}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
