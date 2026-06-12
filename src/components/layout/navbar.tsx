"use client"

import { Menu, GitBranch, Search, BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search/search-bar"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import type { SearchMode, EntityType } from "@/lib/types"

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
  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 lg:hidden"
          onClick={onMobileMenuOpen}
        >
          <Menu className="size-4" />
        </Button>

        <Link
          href="/"
          className="flex items-center gap-2.5 whitespace-nowrap"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-sm">
            <GitBranch className="size-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight hidden sm:inline">
            Issue Finder
          </span>
        </Link>

        <div className="flex items-center gap-1.5 rounded-lg bg-secondary/50 p-0.5">
          <Button
            variant={entityType === "issues" ? "default" : "ghost"}
            size="sm"
            onClick={() => onEntityTypeChange("issues")}
            className={`h-7 gap-1 px-2 text-[11px] ${
              entityType === "issues" ? "shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="size-3" />
            <span className="hidden sm:inline">Issues</span>
          </Button>
          <Button
            variant={entityType === "repositories" ? "default" : "ghost"}
            size="sm"
            onClick={() => onEntityTypeChange("repositories")}
            className={`h-7 gap-1 px-2 text-[11px] ${
              entityType === "repositories" ? "shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="size-3" />
            <span className="hidden sm:inline">Repos</span>
          </Button>
        </div>

        <div className="flex-1 max-w-2xl mx-auto">
          <SearchBar
            value={keyword}
            onChange={onSearch}
            onSubmit={onSubmit}
            mode={searchMode}
            onModeChange={onSearchModeChange}
          />
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
