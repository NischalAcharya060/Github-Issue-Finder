"use client"

import { useState } from "react"
import { Filter, RotateCcw, SlidersHorizontal, Tags, Calendar, Star, Plus, X, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { LANGUAGES, ISSUE_STATES } from "@/lib/constants"
import { LanguageIcon } from "@/components/shared/language-icon"
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

interface SectionProps {
  icon: typeof SlidersHorizontal
  title: string
  children: React.ReactNode
}

function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {title}
      </div>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  )
}

const presets = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "Year", days: 365 },
] as const

function DateInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      <Calendar className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/40" />
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full pl-7 text-xs [color-scheme:var(--color-scheme)]"
        placeholder={placeholder}
      />
    </div>
  )
}

function PresetChips({
  activeFrom,
  activeTo,
  onSelect,
}: {
  activeFrom: string
  activeTo: string
  onSelect: (from: string, to: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {presets.map(({ label, days }) => {
        const from = new Date()
        from.setDate(from.getDate() - days)
        const fromStr = from.toISOString().split("T")[0]
        const toStr = new Date().toISOString().split("T")[0]
        const isActive = activeFrom === fromStr && activeTo === toStr

        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(fromStr, toStr)}
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-all cursor-pointer",
              isActive
                ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                : "text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {label}
          </button>
        )
      })}
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
    <div className="space-y-4 p-4 overflow-x-hidden">
      {/* Header */}
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

      {/* Issue section */}
      <Section icon={SlidersHorizontal} title="Issue">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="h-7 w-full justify-between px-2 text-xs font-normal"
            >
              <span className="flex items-center gap-1.5 truncate">
                {filters.language !== "all" ? (
                  <>
                    <LanguageIcon language={filters.language} className="size-3.5 shrink-0" />
                    {filters.language}
                  </>
                ) : (
                  "Any language"
                )}
              </span>
              <ChevronsUpDown className="size-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search language..." />
              <CommandList>
                <CommandEmpty>No language found</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => update({ language: "all" })}
                  >
                    <Check className={cn("size-3.5", filters.language === "all" ? "opacity-100" : "opacity-0")} />
                    Any language
                  </CommandItem>
                  {LANGUAGES.map((lang) => (
                    <CommandItem
                      key={lang}
                      value={lang}
                      onSelect={() => update({ language: lang })}
                    >
                      <Check className={cn("size-3.5", filters.language === lang ? "opacity-100" : "opacity-0")} />
                      <LanguageIcon language={lang} className="size-3.5 shrink-0" />
                      {lang}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Select
          value={filters.state}
          onValueChange={(v) => update({ state: v as "all" | "open" | "closed" })}
        >
          <SelectTrigger className="h-7 w-full text-xs">
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
      </Section>

      {/* Time section */}
      <div className="border-t border-border/50 pt-3">
        <Section icon={Calendar} title="Time">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">Created</span>
              {(filters.createdFrom || filters.createdTo) && (
                <button
                  type="button"
                  onClick={() => update({ createdFrom: "", createdTo: "" })}
                  className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <DateInput value={filters.createdFrom} onChange={(v) => update({ createdFrom: v })} placeholder="From" />
              <span className="shrink-0 text-[10px] text-muted-foreground/40">—</span>
              <DateInput value={filters.createdTo} onChange={(v) => update({ createdTo: v })} placeholder="To" />
            </div>
            <div className="mt-1.5">
              <PresetChips
                activeFrom={filters.createdFrom}
                activeTo={filters.createdTo}
                onSelect={(from, to) => update({ createdFrom: from, createdTo: to })}
              />
            </div>
          </div>

          <div className="border-t border-border/30 pt-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">Updated</span>
              {(filters.updatedFrom || filters.updatedTo) && (
                <button
                  type="button"
                  onClick={() => update({ updatedFrom: "", updatedTo: "" })}
                  className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <DateInput value={filters.updatedFrom} onChange={(v) => update({ updatedFrom: v })} placeholder="From" />
              <span className="shrink-0 text-[10px] text-muted-foreground/40">—</span>
              <DateInput value={filters.updatedTo} onChange={(v) => update({ updatedTo: v })} placeholder="To" />
            </div>
          </div>
        </Section>
      </div>

      {/* Stars section */}
      <div className="border-t border-border/50 pt-3">
        <Section icon={Star} title="Stars">
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
        </Section>
      </div>

      {/* Labels section */}
      <div className="border-t border-border/50 pt-3">
        <Section icon={Tags} title="Labels">
          <div className="flex items-center gap-2">
            <Input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLabel()}
              placeholder="Add label..."
              className="h-7 flex-1 text-xs"
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
        </Section>
      </div>
    </div>
  )
}
