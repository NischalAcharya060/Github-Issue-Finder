"use client"

import { GitBranch, Search, SlidersHorizontal } from "lucide-react"

const suggestions = [
  { label: "good first issue", query: "good first issue" },
  { label: "help wanted", query: "help wanted" },
  { label: "beginner friendly", query: "beginner" },
  { label: "bug", query: "bug" },
  { label: "hacktoberfest", query: "hacktoberfest" },
]

interface WelcomeProps {
  onSearch: (query: string) => void
}

export function Welcome({ onSearch }: WelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 rounded-full bg-primary/5 p-4">
        <GitBranch className="size-10 text-primary" />
      </div>
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        Find GitHub Issues
      </h2>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        Search millions of GitHub issues across repositories.
        Use the search bar above or try one of these:
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s.query}
            onClick={() => onSearch(s.query)}
            className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="size-3" />
            {s.label}
          </button>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Search className="size-3.5" />
          Search by keyword, repo, or org
        </span>
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="size-3.5" />
          Filter by language, labels, stars
        </span>
      </div>
    </div>
  )
}
