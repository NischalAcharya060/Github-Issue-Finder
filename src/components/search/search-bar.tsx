"use client"

import React from "react"
import { Search, BookOpen, Building2, Hash } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SegmentedControl } from "@/components/shared/segmented-control"
import type { SearchMode } from "@/lib/types"

const modeOptions: { value: SearchMode; label: string; icon: typeof Hash }[] = [
  { value: "keyword", label: "Keyword", icon: Hash },
  { value: "repo", label: "Repo", icon: BookOpen },
  { value: "org", label: "Org", icon: Building2 },
]

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  mode,
  onModeChange,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit(value)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="group relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
        <Input
          id="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "keyword"
              ? "Search issues by keyword…"
              : mode === "repo"
                ? "Search by repository (e.g. owner/repo)…"
                : "Search by organization (e.g. vercel)…"
          }
          className="h-9 rounded-xl border-transparent bg-secondary/60 pr-16 pl-9 text-sm shadow-sm ring-1 ring-border/60 transition-all hover:ring-border focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-[inset_0_-1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.3)] sm:inline-flex">
          ⌘K
        </kbd>
      </div>
      <SegmentedControl
        options={modeOptions}
        value={mode}
        onChange={onModeChange}
        layoutGroup="search-mode"
        className="hidden md:inline-flex"
      />
    </div>
  )
}
