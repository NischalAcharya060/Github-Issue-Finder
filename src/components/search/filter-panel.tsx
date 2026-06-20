"use client"

import { useState } from "react"
import { Filter, RotateCcw, SlidersHorizontal, Tags, Calendar, Star, Plus, X } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { LANGUAGES, ISSUE_STATES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { FilterState } from "@/lib/types"

const defaultFilters: FilterState = {
  language: "all",
  labels: [],
  state: "all",
  createdFrom: "",
  createdTo: "",
  updatedFrom: "",
  updatedTo: "",
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
  const [customLabel, setCustomLabel] = useState("")

  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial })
  }

  const addLabel = () => {
    const label = customLabel.trim()
    if (label && !filters.labels.includes(label)) {
      update({ labels: [...filters.labels, label] })
    }
    setCustomLabel("")
  }

  const removeLabel = (label: string) => {
    update({ labels: filters.labels.filter((l) => l !== label) })
  }

  const hasActiveFilters =
    JSON.stringify(filters) !== JSON.stringify(defaultFilters)

  const activeCount =
    (filters.language !== "all" ? 1 : 0) +
    (filters.state !== "all" ? 1 : 0) +
    (filters.createdFrom ? 1 : 0) +
    (filters.createdTo ? 1 : 0) +
    (filters.updatedFrom ? 1 : 0) +
    (filters.updatedTo ? 1 : 0) +
    (filters.minStars ? 1 : 0) +
    (filters.maxStars ? 1 : 0) +
    filters.labels.length +
    (filters.beginnerFriendly ? 1 : 0) +
    (filters.goodFirstIssue ? 1 : 0) +
    (filters.helpWanted ? 1 : 0)

  return (
    <div className="space-y-5 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15">
            <Filter className="size-3.5 text-primary" />
          </div>
          Filters
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground tabular-nums">
              {activeCount}
            </span>
          )}
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
          <div className="space-y-3 pt-4">
            {/* Created date range */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">Created</span>
                {(filters.createdFrom || filters.createdTo) && (
                  <button
                    type="button"
                    onClick={() => update({ createdFrom: "", createdTo: "" })}
                    className="text-[10px] text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative min-w-0 flex-1 overflow-hidden">
                  <Calendar className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/40" />
                  <Input
                    type="date"
                    value={filters.createdFrom}
                    onChange={(e) => update({ createdFrom: e.target.value })}
                    className="h-7 w-full pl-7 text-xs [color-scheme:var(--color-scheme)]"
                    placeholder="From"
                  />
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground/40">—</span>
                <div className="relative min-w-0 flex-1 overflow-hidden">
                  <Calendar className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/40" />
                  <Input
                    type="date"
                    value={filters.createdTo}
                    onChange={(e) => update({ createdTo: e.target.value })}
                    className="h-7 w-full pl-7 text-xs [color-scheme:var(--color-scheme)]"
                    placeholder="To"
                  />
                </div>
              </div>
              {/* Quick preset chips */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {[
                  { label: "24h", days: 1 },
                  { label: "7d", days: 7 },
                  { label: "30d", days: 30 },
                  { label: "90d", days: 90 },
                  { label: "Year", days: 365 },
                ].map((preset) => {
                  const from = new Date()
                  from.setDate(from.getDate() - preset.days)
                  const fromStr = from.toISOString().split("T")[0]
                  const toStr = new Date().toISOString().split("T")[0]
                  const isActive = filters.createdFrom === fromStr && filters.createdTo === toStr
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => update({ createdFrom: fromStr, createdTo: toStr })}
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                          : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Updated date range */}
            <div className="border-t border-border/30 pt-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">Updated</span>
                {(filters.updatedFrom || filters.updatedTo) && (
                  <button
                    type="button"
                    onClick={() => update({ updatedFrom: "", updatedTo: "" })}
                    className="text-[10px] text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative min-w-0 flex-1 overflow-hidden">
                  <Calendar className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/40" />
                  <Input
                    type="date"
                    value={filters.updatedFrom}
                    onChange={(e) => update({ updatedFrom: e.target.value })}
                    className="h-7 w-full pl-7 text-xs [color-scheme:var(--color-scheme)]"
                    placeholder="From"
                  />
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground/40">—</span>
                <div className="relative min-w-0 flex-1 overflow-hidden">
                  <Calendar className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/40" />
                  <Input
                    type="date"
                    value={filters.updatedTo}
                    onChange={(e) => update({ updatedTo: e.target.value })}
                    className="h-7 w-full pl-7 text-xs [color-scheme:var(--color-scheme)]"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
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
            <div className="flex items-center gap-2">
              <Input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLabel()}
                placeholder="Add custom label..."
                className="h-7 text-xs flex-1"
              />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={addLabel}
                disabled={!customLabel.trim()}
              >
                <Plus className="size-3" />
              </Button>
            </div>

            {filters.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.labels.map((label) => (
                  <Badge
                    key={label}
                    variant="outline"
                    className="gap-1 pr-1 text-[10px]"
                  >
                    {label}
                    <button
                      onClick={() => removeLabel(label)}
                      className="hover:text-destructive"
                    >
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

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
