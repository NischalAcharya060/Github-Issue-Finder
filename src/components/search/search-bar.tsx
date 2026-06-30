"use client"

import React, { useState } from "react"
import { Search, Building2, Hash, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { SearchMode } from "@/lib/types"

const modeOptions: { value: SearchMode; label: string; icon: typeof Hash }[] = [
  { value: "keyword", label: "Keyword", icon: Hash },
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
  const [isFocused, setIsFocused] = useState(false)
  const [isHoveredDropdown, setIsHoveredDropdown] = useState(false)
  const [searches] = useLocalStorage<string[]>("recent-searches", [])

  const suggestions = [
    { value: "label:", label: "Filter by label (e.g. label:\"good first issue\")" },
    { value: "org:", label: "Filter by organization (e.g. org:vercel)" },
    { value: "repo:", label: "Filter by repository (e.g. repo:facebook/react)" },
    { value: "language:", label: "Filter by language (e.g. language:TypeScript)" },
    { value: "stars:", label: "Filter by stars count (e.g. stars:>=1000)" },
    { value: "state:open", label: "Filter open status" },
    { value: "state:closed", label: "Filter closed status" },
  ]

  const activeSuggestions = value.trim()
    ? suggestions.filter(s => s.value.toLowerCase().includes(value.toLowerCase()) || s.label.toLowerCase().includes(value.toLowerCase()))
    : suggestions.slice(0, 5)

  const handleSelectSuggestion = (text: string) => {
    if (text.endsWith(":")) {
      const endsWithSpace = value === "" || value.endsWith(" ")
      onChange(endsWithSpace ? `${value}${text}` : `${value} ${text}`)
    } else {
      onChange(text)
      if (onSubmit) onSubmit(text)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit(value)
      setIsFocused(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="group relative flex-1"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
        <Input
          id="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "keyword"
              ? "Search issues by keyword…"
              : "Search by organization (e.g. vercel)…"
          }
          className="h-9 rounded-xl border-transparent bg-secondary/60 pr-16 pl-9 text-sm shadow-sm ring-1 ring-border/60 transition-all hover:ring-border focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-[inset_0_-1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.3)] sm:inline-flex">
          ⌘K
        </kbd>

        {(isFocused || isHoveredDropdown) && (
          <div
            className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-2xl border border-border bg-popover/95 p-2 shadow-lg ring-1 ring-foreground/[0.04] backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-1 duration-150"
            onMouseEnter={() => setIsHoveredDropdown(true)}
            onMouseLeave={() => setIsHoveredDropdown(false)}
          >
            {!value.trim() && searches && searches.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/75">
                  Recent Searches
                </div>
                <div className="space-y-0.5">
                  {searches.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectSuggestion(q)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-muted-foreground hover:bg-secondary/70 hover:text-foreground cursor-pointer transition-colors"
                    >
                      <Clock className="size-3 text-muted-foreground/70" />
                      <span className="truncate">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/75">
                Quick Query Filters
              </div>
              <div className="space-y-0.5">
                {activeSuggestions.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectSuggestion(s.value)}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-secondary/70 cursor-pointer transition-colors"
                  >
                    <span className="font-mono text-primary font-semibold">{s.value}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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
