"use client"

import React from "react"
import { Search, BookOpen, Building2, Hash } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { SearchMode } from "@/lib/types"

const modeIcons: Record<SearchMode, typeof Hash> = {
  keyword: Hash,
  repo: BookOpen,
  org: Building2,
}

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
}

export function SearchBar({ value, onChange, mode, onModeChange }: SearchBarProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            mode === "keyword"
              ? "Search issues by keyword..."
              : mode === "repo"
                ? "Search by repository (e.g. owner/repo)..."
                : "Search by organization (e.g. vercel)..."
          }
          className="pl-9"
        />
      </div>
      <div className="flex gap-1 rounded-lg border p-0.5">
        {(["keyword", "repo", "org"] as const).map((m) => {
          const Icon = modeIcons[m]
          return (
            <Button
              key={m}
              variant={mode === m ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange(m)}
              className="gap-1.5"
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
