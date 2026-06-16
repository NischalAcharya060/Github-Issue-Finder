"use client"

import { useState } from "react"
import { Sparkles, Settings2, Code2, Tags, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IssueList } from "@/components/issues/issue-list"
import { Pagination } from "@/components/shared/pagination"
import { useGithubSearch } from "@/hooks/use-github-search"
import { SettingsDialog } from "@/components/layout/settings-dialog"
import type { FilterState, SearchResponse } from "@/lib/types"

const defaultFilters: FilterState = {
  language: "all",
  labels: [],
  state: "open",
  createdYear: "all",
  updatedYear: "all",
  minStars: "",
  maxStars: "",
  beginnerFriendly: false,
  goodFirstIssue: false,
  helpWanted: false,
}

const NOW_MS = typeof window !== "undefined" ? Date.now() : 0

interface ForYouFeedProps {
  onIssueClick: (id: number) => void
}

export function ForYouFeed({ onIssueClick }: ForYouFeedProps) {
  const [languages] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedLangs = localStorage.getItem("developer-languages")
      return savedLangs ? JSON.parse(savedLangs) : ["typescript", "javascript"]
    }
    return ["typescript", "javascript"]
  })
  const [labels] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedLabels = localStorage.getItem("developer-labels")
      return savedLabels ? JSON.parse(savedLabels) : ["good first issue"]
    }
    return ["good first issue"]
  })
  const [experience] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("developer-experience") || "beginner"
    }
    return "beginner"
  })
  const [page, setPage] = useState(1)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Build the advanced query using OR operations for multiple choices
  const buildRecommendationsQuery = () => {
    if (languages.length === 0 && labels.length === 0) return ""

    const parts = ["is:issue", "state:open"]

    if (languages.length > 0) {
      const langPart = languages.map(lang => `language:${lang}`).join(" OR ")
      parts.push(`(${langPart})`)
    }

    if (labels.length > 0) {
      const labelPart = labels.map(lbl => `label:"${lbl}"`).join(" OR ")
      parts.push(`(${labelPart})`)
    }

    return parts.join(" ")
  }

  const query = buildRecommendationsQuery()

  const { data, isLoading, isError } = useGithubSearch(
    query,
    "keyword",
    "issues",
    defaultFilters,
    "created-desc",
    page
  )

  const totalPages = data
    ? Math.min(Math.ceil((data as SearchResponse).total_count / 30), 100)
    : 0

  if (languages.length === 0 && labels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/85 bg-card/40 p-12 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Sparkles className="size-6 text-primary animate-pulse" />
        </div>
        <h3 className="text-base font-bold">Personalize your feed</h3>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
          Select your favorite languages and preferred labels to get customized issue recommendations delivered straight to your dashboard.
        </p>
        <Button onClick={() => setSettingsOpen(true)} className="mt-5 gap-1.5" size="sm">
          <Settings2 className="size-3.5" />
          Configure Stack
        </Button>
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    )
  }

  // Add match scores to issues dynamically
  const issuesWithMatchScores = data
    ? (data as SearchResponse).items.map((issue, index) => {
        let score = 80
        
        const matchedLabels = issue.labels.filter(l => 
          labels.some(pref => l.name.toLowerCase().includes(pref.toLowerCase()))
        )
        score += matchedLabels.length * 5

        // Boost for fresh issues
        const ageInDays = (NOW_MS - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)
        if (ageInDays < 7) score += 5
        else if (ageInDays < 30) score += 2

        // Adjust based on experience level
        const hasBeginnerLabel = issue.labels.some(l => 
          ["good first issue", "beginner", "easy", "first-timers-only"].some(b => 
            l.name.toLowerCase().includes(b)
          )
        )

        if (experience === "beginner") {
          if (hasBeginnerLabel) score += 8
          else score -= 5
        } else if (experience === "advanced") {
          if (hasBeginnerLabel) score -= 8
          else score += 5
        } else {
          if (hasBeginnerLabel) score += 2
        }

        const finalScore = Math.min(Math.max(score + (index % 5), 82), 99)

        return {
          ...issue,
          matchScore: finalScore,
        }
      })
    : []

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/8 to-primary/2 px-5 py-4 shadow-sm shadow-primary/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-base font-bold tracking-tight">
              <Sparkles className="size-4 text-primary animate-pulse" />
              Personalized Contributions
            </h2>
            <p className="text-xs text-muted-foreground leading-normal max-w-xl">
              Showing active, open-source issues selected for your developer profile.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setSettingsOpen(true)}
              className="gap-1 bg-background/50 backdrop-blur-sm"
            >
              <Settings2 className="size-3" />
              Adjust Stack
            </Button>
          </div>
        </div>

        {/* Display Current Stack Details */}
        <div className="mt-3.5 flex flex-wrap items-center gap-4 border-t border-primary/10 pt-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Code2 className="size-3.5 text-primary" />
            <span className="font-semibold text-foreground">Languages:</span>
            <div className="flex gap-1 font-medium">
              {languages.map(l => (
                <span key={l} className="bg-primary/5 text-primary px-1.5 py-0.5 rounded-md border border-primary/10">
                  {l === "cpp" ? "C++" : l.charAt(0).toUpperCase() + l.slice(1)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Tags className="size-3.5 text-primary" />
            <span className="font-semibold text-foreground">Labels:</span>
            <div className="flex gap-1 font-medium">
              {labels.map(l => (
                <span key={l} className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-md border border-border">
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Sliders className="size-3.5 text-primary" />
            <span className="font-semibold text-foreground">Level:</span>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md border border-amber-500/20 font-medium capitalize">
              {experience}
            </span>
          </div>
        </div>
      </div>

      {/* Issues Listing */}
      <IssueList
        issues={issuesWithMatchScores}
        isLoading={isLoading}
        isError={isError}
        totalCount={data?.total_count ?? 0}
        onIssueClick={onIssueClick}
      />

      {data && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={(data as SearchResponse).total_count}
          onPageChange={setPage}
        />
      )}

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
