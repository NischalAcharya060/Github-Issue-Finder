"use client"

import { useEffect, useState } from "react"
import { Menu, GitBranch, Search, BookOpen, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search/search-bar"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { InstallButton } from "@/components/shared/install-button"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { SettingsDialog } from "@/components/layout/settings-dialog"
import { cn } from "@/lib/utils"
import type { SearchMode, EntityType } from "@/lib/types"


const entityOptions: { value: EntityType; label: string; icon: typeof Search }[] = [
  { value: "issues", label: "Issues", icon: Search },
  { value: "repositories", label: "Repos", icon: BookOpen },
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

  return (
    <header
      className={cn(
        "glass sticky top-0 z-30 border-b transition-all duration-300",
        scrolled
          ? "border-border/60 shadow-sm shadow-foreground/[0.03]"
          : "border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
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

        <div className="mx-auto max-w-2xl flex-1">
          <SearchBar
            value={keyword}
            onChange={onSearch}
            onSubmit={onSubmit}
            mode={searchMode}
            onModeChange={onSearchModeChange}
          />
        </div>

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
        </div>
      </div>
    </header>
  )
}
