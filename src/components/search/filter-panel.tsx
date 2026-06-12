"use client"

import { Filter, RotateCcw, SlidersHorizontal, Tags, Calendar, Star } from "lucide-react"
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

function FilterSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof SlidersHorizontal
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
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
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="size-4" />
          Filters
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onChange(defaultFilters)}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-4 divide-y divide-border/50">
        <FilterSection icon={SlidersHorizontal} title="Issue">
          <div className="space-y-2">
            <Select
              value={filters.language}
              onValueChange={(v) => update({ language: v })}
            >
              <SelectTrigger className="w-full h-7 text-xs">
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

            <Select
              value={filters.state}
              onValueChange={(v) =>
                update({ state: v as "all" | "open" | "closed" })
              }
            >
              <SelectTrigger className="w-full h-7 text-xs">
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
        </FilterSection>

        <FilterSection icon={Calendar} title="Time">
          <div className="space-y-2 pt-4">
            <Select
              value={filters.createdYear}
              onValueChange={(v) => update({ createdYear: v })}
            >
              <SelectTrigger className="w-full h-7 text-xs">
                <SelectValue placeholder="Created year" />
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

            <Select
              value={filters.updatedYear}
              onValueChange={(v) => update({ updatedYear: v })}
            >
              <SelectTrigger className="w-full h-7 text-xs">
                <SelectValue placeholder="Updated year" />
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
        </FilterSection>

        <FilterSection icon={Star} title="Stars">
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                placeholder="Min"
                value={filters.minStars}
                onChange={(e) => update({ minStars: e.target.value })}
                className="h-7 text-xs"
              />
              <span className="text-muted-foreground/50">-</span>
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
        </FilterSection>

        <FilterSection icon={Tags} title="Labels">
          <div className="space-y-2 pt-4">
            {(
              [
                ["beginner", "Beginner friendly", filters.beginnerFriendly],
                ["good-first-issue", "Good first issue", filters.goodFirstIssue],
                ["help-wanted", "Help wanted", filters.helpWanted],
              ] as const
            ).map(([id, label, checked]) => (
              <div key={id} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(v) =>
                    update({
                      [id === "beginner"
                        ? "beginnerFriendly"
                        : id === "good-first-issue"
                          ? "goodFirstIssue"
                          : "helpWanted"]: v === true,
                    })
                  }
                />
                <Label
                  htmlFor={id}
                  className="text-xs font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  )
}
