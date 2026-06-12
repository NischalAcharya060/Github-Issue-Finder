"use client"

import { Filter, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { LANGUAGES, ISSUE_STATES, YEARS } from "@/lib/constants"
import type { FilterState } from "@/lib/types"

const defaultFilters: FilterState = {
  language: "all",
  labels: [],
  state: "all",
  createdYear: "all",
  updatedYear: "all",
  minStars: "",
  maxStars: "",
  beginnerFriendly: false,
  goodFirstIssue: false,
  helpWanted: false,
}

interface FilterPanelProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial })
  }

  const hasActiveFilters =
    JSON.stringify(filters) !== JSON.stringify(defaultFilters)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="size-4" />
          Filters
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onChange(defaultFilters)}
            className="gap-1 text-xs"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Language</Label>
        <Select
          value={filters.language}
          onValueChange={(v) => update({ language: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any language</SelectItem>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>State</Label>
        <Select
          value={filters.state}
          onValueChange={(v) =>
            update({ state: v as "all" | "open" | "closed" })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            {ISSUE_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Created year</Label>
        <Select
          value={filters.createdYear}
          onValueChange={(v) => update({ createdYear: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any year</SelectItem>
            {YEARS.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Updated year</Label>
        <Select
          value={filters.updatedYear}
          onValueChange={(v) => update({ updatedYear: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any year</SelectItem>
            {YEARS.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Stars range</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minStars}
            onChange={(e) => update({ minStars: e.target.value })}
            className="h-7 text-xs"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxStars}
            onChange={(e) => update({ maxStars: e.target.value })}
            className="h-7 text-xs"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">
          Special labels
        </Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="beginner"
              checked={filters.beginnerFriendly}
              onCheckedChange={(v) =>
                update({ beginnerFriendly: v === true })
              }
            />
            <Label htmlFor="beginner" className="text-sm font-normal">
              Beginner friendly
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="good-first-issue"
              checked={filters.goodFirstIssue}
              onCheckedChange={(v) => update({ goodFirstIssue: v === true })}
            />
            <Label htmlFor="good-first-issue" className="text-sm font-normal">
              Good first issue
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="help-wanted"
              checked={filters.helpWanted}
              onCheckedChange={(v) => update({ helpWanted: v === true })}
            />
            <Label htmlFor="help-wanted" className="text-sm font-normal">
              Help wanted
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
