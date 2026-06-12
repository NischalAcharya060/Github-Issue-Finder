"use client"

import { Menu, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search/search-bar"
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
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 lg:hidden"
          onClick={onMobileMenuOpen}
        >
          <Menu className="size-4" />
        </Button>

        <a
          href="/"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <GitBranch className="size-5" />
          <span className="text-sm font-semibold hidden sm:inline">
            Issue Finder
          </span>
        </a>

        <div className="flex-1">
          <SearchBar
            value={keyword}
            onChange={onSearch}
            mode={searchMode}
            onModeChange={onSearchModeChange}
          />
        </div>
      </div>
    </header>
  )
}
