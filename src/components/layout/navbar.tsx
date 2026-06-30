"use client"

import { useEffect, useState } from "react"
import { Menu, GitBranch, Search, BookOpen, Settings, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search/search-bar"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { InstallButton } from "@/components/shared/install-button"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { SettingsDialog } from "@/components/layout/settings-dialog"
import { AuthButton } from "@/components/auth/auth-button"
import { cn } from "@/lib/utils"
import type { SearchMode, EntityType } from "@/lib/types"


const entityOptions: { value: EntityType; label: string; icon: typeof Search }[] = [
  { value: "issues", label: "Issues", icon: Search },
  { value: "repositories", label: "Repos", icon: BookOpen },
  { value: "foryou", label: "For You", icon: Sparkles },
  { value: "trending", label: "Trending", icon: TrendingUp },
]

interface NavbarProps {
  keyword: string
  onSearch: (value: string) => void
  onSubmit?: (value: string) => void
  searchMode: SearchMode
  entityType: EntityType
  onSearchModeChange: (mode: SearchMode) => void
  onEntityTypeChange: (type: EntityType) => void
  onMobileMenuOpen: () => void
}

export function Navbar({
  keyword,
  onSearch,
  onSubmit,
  searchMode,
  entityType,
  onSearchModeChange,
  onEntityTypeChange,
  onMobileMenuOpen,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const showSearch = entityType !== "foryou" && entityType !== "trending"

  return (
    <header
      className={cn(
        "glass sticky top-0 z-30 border-b transition-all duration-300",
        scrolled
          ? "border-border/45 bg-background/80 shadow-md shadow-foreground/[0.02]"
          : "border-transparent bg-background/30"
      )}
    >
      {/* ── Desktop layout (single row, unchanged) ── */}
      <div className="mx-auto hidden max-w-7xl items-center gap-3 px-4 py-2.5 lg:flex">
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 lg:hidden"
          onClick={onMobileMenuOpen}
          aria-label="Open filters"
        >
          <Menu className="size-4" />
        </Button>

        <Link
          href="/"
          className="group flex items-center gap-2.5 whitespace-nowrap"
        >
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/55 shadow-sm shadow-primary/30 ring-1 ring-white/10 transition-transform group-hover:scale-105">
            <GitBranch className="size-4 text-primary-foreground" />
          </div>
          <span className="text-gradient hidden text-base font-bold tracking-tight sm:inline">
            Issue Finder
          </span>
        </Link>

        <SegmentedControl
          options={entityOptions}
          value={entityType}
          onChange={onEntityTypeChange}
          layoutGroup="entity-type"
        />

        {entityType === "foryou" ? (
          <div className="mx-auto flex-1 max-w-2xl flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1.5 text-[10px] font-bold text-primary tracking-wide uppercase ring-1 ring-primary/15 animate-pulse shrink-0">
              <Sparkles className="size-3 text-primary" />
              Personalized Recommendation Stream
            </span>
          </div>
        ) : entityType === "trending" ? (
          <div className="mx-auto flex-1 max-w-2xl flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/8 px-3.5 py-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wide uppercase ring-1 ring-amber-500/15 animate-pulse shrink-0">
              <TrendingUp className="size-3" />
              Trending Across GitHub
            </span>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl flex-1">
            <SearchBar
              value={keyword}
              onChange={onSearch}
              onSubmit={onSubmit}
              mode={searchMode}
              onModeChange={onSearchModeChange}
            />
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <InstallButton />
          <ThemeToggle />
          <SettingsDialog
            trigger={
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground" aria-label="Settings">
                <Settings className="size-4" />
              </Button>
            }
          />
          <AuthButton />
        </div>
      </div>

      {/* ── Mobile layout (two rows) ── */}
      <div className="lg:hidden">
        {/* Top row: hamburger + logo + tabs + actions */}
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={onMobileMenuOpen}
            aria-label="Open filters"
          >
            <Menu className="size-4" />
          </Button>

          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/55 shadow-sm shadow-primary/30 ring-1 ring-white/10 transition-transform group-hover:scale-105">
              <GitBranch className="size-4 text-primary-foreground" />
            </div>
          </Link>

          <div className="min-w-0 overflow-x-auto">
            <SegmentedControl
              options={entityOptions}
              value={entityType}
              onChange={onEntityTypeChange}
              layoutGroup="entity-type"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>

        {/* Bottom row: search or badge */}
        <div className="border-t border-border/30 px-4 py-2">
          {showSearch ? (
            <SearchBar
              value={keyword}
              onChange={onSearch}
              onSubmit={onSubmit}
              mode={searchMode}
              onModeChange={onSearchModeChange}
            />
          ) : entityType === "foryou" ? (
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-[10px] font-bold text-primary tracking-wide uppercase ring-1 ring-primary/15 animate-pulse">
                <Sparkles className="size-3 text-primary" />
                For You
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/8 px-3 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wide uppercase ring-1 ring-amber-500/15 animate-pulse">
                <TrendingUp className="size-3" />
                Trending
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
