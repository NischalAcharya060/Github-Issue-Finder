"use client"

import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import { Bookmark, Trash2 } from "lucide-react"

interface SavedSearchesProps {
  onSelect: (query: string) => void
}

export function SavedSearches({ onSelect }: SavedSearchesProps) {
  const [savedSearches, , clearSaved] = useLocalStorage<
    { name: string; query: string }[]
  >("saved-searches", [])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15">
            <Bookmark className="size-3.5 text-primary" />
          </div>
          Saved
        </div>
        {savedSearches.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={clearSaved}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="size-3" />
            Clear
          </Button>
        )}
      </div>
      <div className="mt-3">
        {savedSearches.length === 0 ? (
          <p className="text-xs text-muted-foreground">No saved searches yet</p>
        ) : (
          <div className="space-y-0.5">
            {savedSearches.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => onSelect(s.query)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground cursor-pointer"
              >
                <Bookmark className="size-3 shrink-0" />
                <span className="truncate">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
