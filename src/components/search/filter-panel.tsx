"use client"

import { useState } from "react"
import { Filter, RotateCcw, SlidersHorizontal, Tags, Calendar, Star, Plus, X, Check, ChevronsUpDown, Save, Bookmark } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { LANGUAGES, ISSUE_STATES } from "@/lib/constants"
import { LanguageIcon } from "@/components/shared/language-icon"
import { DatePickerPopover } from "@/components/shared/date-picker-popover"
import { useLocalStorage } from "@/hooks/use-local-storage"
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
    <div className="rounded-2xl border border-border/55 bg-card/45 p-3.5 shadow-sm shadow-foreground/[0.01] ring-1 ring-foreground/[0.01] transition-all hover:border-border/80">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/85">
        <Icon className="size-3.5 text-muted-foreground/60" />
        {title}
      </div>
      <div className="mt-3 space-y-3">{children}</div>
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
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative min-w-0 flex-1">
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-8.5 w-full items-center rounded-xl border border-border/60 bg-background/50 pl-8.5 pr-2.5 text-xs text-left text-foreground transition-all hover:bg-background/80 hover:border-primary/30 outline-none placeholder:text-muted-foreground cursor-pointer"
          >
            {value ? format(new Date(value + "T00:00:00"), "MMM d, yyyy") : <span className="text-muted-foreground">{placeholder}</span>}
          </button>
        </PopoverTrigger>
        <Calendar className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <DatePickerPopover value={value} onChange={onChange} onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
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
  const [presetName, setPresetName] = useState("")

  const [savedPresets, setSavedPresets] = useLocalStorage<Record<string, FilterState>>(
    "saved-filter-presets",
    {
      "Good First Issues": { ...defaultFilters, goodFirstIssue: true },
      "TypeScript Starters": { ...defaultFilters, language: "TypeScript", goodFirstIssue: true },
    }
  )

  const handleSavePreset = () => {
    const name = presetName.trim()
    if (!name) return
    setSavedPresets((prev) => ({
      ...prev,
      [name]: { ...filters },
    }))
    setPresetName("")
  }

  const handleDeletePreset = (name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavedPresets((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const loadPreset = (presetFilters: FilterState) => {
    onChange(presetFilters)
  }

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
      <div className="flex items-center justify-between gap-2 px-1">
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
        <div className="flex items-center gap-1.5 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Bookmark className="size-3" />
                Presets
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 space-y-3" align="end">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/85">
                <Bookmark className="size-3 text-muted-foreground/60" />
                Filter Presets
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.keys(savedPresets).length === 0 ? (
                  <span className="text-[10px] text-muted-foreground/50">No presets saved yet</span>
                ) : (
                  Object.entries(savedPresets).map(([name, presetFilters]) => {
                    const isActive = JSON.stringify(filters) === JSON.stringify(presetFilters)
                    return (
                      <div
                        key={name}
                        onClick={() => loadPreset(presetFilters)}
                        className={cn(
                          "flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all cursor-pointer border",
                          isActive
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-background text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <span className="truncate max-w-[120px]">{name}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePreset(name, e)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive shrink-0 cursor-pointer"
                          title={`Delete preset ${name}`}
                        >
                          <X className="size-2.5" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="flex items-center gap-1">
                <Input
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Preset name..."
                  className="h-7 text-xs bg-background border-border/60 py-0.5 px-2 flex-1"
                />
                <Button
                  size="xs"
                  onClick={handleSavePreset}
                  disabled={!presetName.trim()}
                  className="h-7 px-2 text-xs gap-1 cursor-pointer"
                >
                  <Save className="size-3" />
                  Save
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onChange(defaultFilters)}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 cursor-pointer shrink-0 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="size-3.5" />
              <span className="sr-only">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Issue section */}
      <Section icon={SlidersHorizontal} title="Issue">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="h-8.5 w-full justify-between px-3 text-xs font-medium rounded-xl bg-background/50 border-border/60 hover:bg-background/80 hover:border-primary/30 hover:text-foreground text-muted-foreground transition-all cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                {filters.language !== "all" ? (
                  <>
                    <LanguageIcon language={filters.language} className="size-3.5 shrink-0 text-foreground" />
                    <span className="text-foreground">{filters.language}</span>
                  </>
                ) : (
                  <span>Any language</span>
                )}
              </span>
              <ChevronsUpDown className="size-3 shrink-0 opacity-50 text-muted-foreground" />
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
          <SelectTrigger className="h-8.5 w-full text-xs font-medium rounded-xl bg-background/50 border-border/60 hover:bg-background/80 hover:border-primary/30 transition-all cursor-pointer">
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
      <Section icon={Calendar} title="Time">
        <div className="space-y-3.5">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">Created</span>
              {(filters.createdFrom || filters.createdTo) && (
                <button
                  type="button"
                  onClick={() => update({ createdFrom: "", createdTo: "" })}
                  className="cursor-pointer text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <DateInput value={filters.createdFrom} onChange={(v) => update({ createdFrom: v })} placeholder="From" />
              <span className="shrink-0 text-[10px] text-muted-foreground/45">—</span>
              <DateInput value={filters.createdTo} onChange={(v) => update({ createdTo: v })} placeholder="To" />
            </div>
            <div className="mt-2">
              <PresetChips
                activeFrom={filters.createdFrom}
                activeTo={filters.createdTo}
                onSelect={(from, to) => update({ createdFrom: from, createdTo: to })}
              />
            </div>
          </div>

          <div className="border-t border-border/30 pt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">Updated</span>
              {(filters.updatedFrom || filters.updatedTo) && (
                <button
                  type="button"
                  onClick={() => update({ updatedFrom: "", updatedTo: "" })}
                  className="cursor-pointer text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <DateInput value={filters.updatedFrom} onChange={(v) => update({ updatedFrom: v })} placeholder="From" />
              <span className="shrink-0 text-[10px] text-muted-foreground/45">—</span>
              <DateInput value={filters.updatedTo} onChange={(v) => update({ updatedTo: v })} placeholder="To" />
            </div>
          </div>
        </div>
      </Section>

      {/* Stars section */}
      <Section icon={Star} title="Stars">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minStars}
            onChange={(e) => update({ minStars: e.target.value })}
            className="h-8.5 rounded-xl bg-background/50 border-border/60 text-xs focus-visible:ring-2 focus-visible:ring-primary/45"
          />
          <span className="text-muted-foreground/50 text-xs">—</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxStars}
            onChange={(e) => update({ maxStars: e.target.value })}
            className="h-8.5 rounded-xl bg-background/50 border-border/60 text-xs focus-visible:ring-2 focus-visible:ring-primary/45"
          />
        </div>
      </Section>

      {/* Labels section */}
      <Section icon={Tags} title="Labels">
        <div className="space-y-3.5">
          <div className="flex items-center gap-1.5">
            <Input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLabel()}
              placeholder="Add label..."
              className="h-8.5 flex-1 rounded-xl bg-background/50 border-border/60 text-xs focus-visible:ring-2 focus-visible:ring-primary/45"
            />
            <Button
              variant="outline"
              size="icon-sm"
              onClick={addLabel}
              disabled={!customLabel.trim()}
              className="h-8.5 w-8.5 rounded-xl border border-border/60 bg-background/50 cursor-pointer shrink-0"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          {filters.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.labels.map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="gap-1 pr-1 text-[10px] rounded-lg"
                >
                  {label}
                  <button
                    onClick={() => removeLabel(label)}
                    className="hover:text-destructive cursor-pointer"
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { id: "beginnerFriendly", label: "Beginner friendly", active: filters.beginnerFriendly, color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25" },
              { id: "goodFirstIssue", label: "Good first issue", active: filters.goodFirstIssue, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25" },
              { id: "helpWanted", label: "Help wanted", active: filters.helpWanted, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25" },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => update({ [chip.id]: !chip.active })}
                className={cn(
                  "inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-all",
                  chip.active
                    ? `${chip.color} ring-1 ring-primary/10 shadow-sm`
                    : "bg-background text-muted-foreground border-border/80 hover:bg-muted/30 hover:text-foreground"
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
