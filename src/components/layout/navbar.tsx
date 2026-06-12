"use client"

import { Menu, GitBranch } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search/search-bar"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import type { SearchMode } from "@/lib/types"

interface NavbarProps {
  keyword: string
  onSearch: (value: string) => void
  searchMode: SearchMode
  onSearchModeChange: (mode: SearchMode) => void
  onMobileMenuOpen: () => void
}

export function Navbar({
  keyword,
  onSearch,
  searchMode,
  onSearchModeChange,
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

        <div className="flex-1 max-w-2xl mx-auto">
          <SearchBar
            value={keyword}
            onChange={onSearch}
            mode={searchMode}
            onModeChange={onSearchModeChange}
          />
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
