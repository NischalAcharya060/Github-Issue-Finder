"use client"

import { GitBranch, Search, SlidersHorizontal, Sparkles, GitFork, Code2 } from "lucide-react"

const suggestions = [
  { label: "good first issue", query: "good first issue" },
  { label: "help wanted", query: "help wanted" },
  { label: "beginner friendly", query: "beginner" },
  { label: "bug", query: "bug" },
  { label: "hacktoberfest", query: "hacktoberfest" },
]

const quickLanguages = [
  { label: "Python", query: "language:python" },
  { label: "TypeScript", query: "language:typescript" },
  { label: "Rust", query: "language:rust" },
  { label: "Go", query: "language:go" },
  { label: "JavaScript", query: "language:javascript" },
]

const popularOrgs = [
  { label: "vercel", query: "org:vercel" },
  { label: "facebook", query: "org:facebook" },
  { label: "microsoft", query: "org:microsoft" },
  { label: "google", query: "org:google" },
]

interface WelcomeProps {
  onSearch: (query: string) => void
}

export function Welcome({ onSearch }: WelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10 blur-xl" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 ring-1 ring-white/10">
          <GitBranch className="size-8 text-primary-foreground" />
        </div>
      </div>

      <h2 className="mb-3 text-3xl font-semibold tracking-tight">
        Find GitHub Issues
      </h2>

      <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
        Search millions of GitHub issues across repositories.
        Use the search bar above or try one of these quick searches:
      </p>

      <div className="space-y-6">
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Quick Suggestions</div>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s.query}
                onClick={() => onSearch(s.query)}
                className="group inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-md hover:shadow-primary/5"
              >
                <Search className="size-3 transition-transform group-hover:scale-110" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Top Languages</div>
          <div className="flex flex-wrap justify-center gap-2">
            {quickLanguages.map((l) => (
              <button
                key={l.query}
                onClick={() => onSearch(l.query)}
                className="group inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-md"
              >
                <Code2 className="size-3 transition-transform group-hover:scale-110" />
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Popular Organizations</div>
          <div className="flex flex-wrap justify-center gap-2">
            {popularOrgs.map((o) => (
              <button
                key={o.query}
                onClick={() => onSearch(o.query)}
                className="group inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-md"
              >
                <GitFork className="size-3 transition-transform group-hover:scale-110" />
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-8 text-xs text-muted-foreground/80">
        <span className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/5 ring-1 ring-primary/10">
            <Search className="size-3 text-primary" />
          </span>
          Search by keyword, repo, or org
        </span>
        <span className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/5 ring-1 ring-primary/10">
            <SlidersHorizontal className="size-3 text-primary" />
          </span>
          Filter by language, labels, stars
        </span>
        <span className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/5 ring-1 ring-primary/10">
            <Sparkles className="size-3 text-primary" />
          </span>
          Uncover hidden opportunities
        </span>
      </div>
    </div>
  )
}
