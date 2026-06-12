"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className="min-w-8"
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>

      <span className="ml-2 text-xs text-muted-foreground">
        {totalCount.toLocaleString()} results
      </span>
    </div>
  )
}

function getPageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "...")[] = []

  if (current <= 3) {
    for (let i = 1; i <= 4; i++) pages.push(i)
    pages.push("...")
    pages.push(total)
  } else if (current >= total - 2) {
    pages.push(1)
    pages.push("...")
    for (let i = total - 3; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push("...")
    pages.push(current - 1)
    pages.push(current)
    pages.push(current + 1)
    pages.push("...")
    pages.push(total)
  }

  return pages
}
