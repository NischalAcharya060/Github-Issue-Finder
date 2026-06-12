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

  if (savedSearches.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Bookmark className="size-4" />
          Saved Searches
        </div>
        <Button
          variant="ghost"
          size="xs"
          onClick={clearSaved}
          className="gap-1 text-xs"
        >
          <Trash2 className="size-3" />
          Clear
        </Button>
      </div>
      <div className="space-y-1">
        {savedSearches.map((s) => (
          <Button
            key={s.name}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
            onClick={() => onSelect(s.query)}
          >
            <Bookmark className="size-3 shrink-0" />
            <span className="truncate">{s.name}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
