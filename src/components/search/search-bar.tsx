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
    <div className="flex gap-1.5">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
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
          className="h-8 pl-8 text-xs bg-secondary/50 border-secondary hover:border-border focus:bg-background transition-colors"
        />
      </div>
      <div className="flex gap-0.5 rounded-lg bg-secondary/50 p-0.5">
        {(["keyword", "repo", "org"] as const).map((m) => {
          const Icon = modeIcons[m]
          return (
            <Button
              key={m}
              variant={mode === m ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange(m)}
              className={`h-7 gap-1 px-2 text-[11px] ${
                mode === m
                  ? "shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3" />
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
