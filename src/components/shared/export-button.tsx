"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SearchResponse, GitHubIssue } from "@/lib/types"

interface ExportButtonProps {
  data?: SearchResponse
  items?: GitHubIssue[]
  filename: string
}

function toCsvRow(issue: GitHubIssue) {
  return [
    `"${issue.title.replace(/"/g, '""')}"`,
    issue.state,
    issue.repository_url.replace("https://api.github.com/repos/", ""),
    `"${issue.labels.map((l) => l.name).join(", ")}"`,
    issue.created_at,
    issue.comments,
    issue.score,
    issue.user?.login ?? "",
    issue.html_url,
  ]
}

export function ExportButton({ data, items, filename }: ExportButtonProps) {
  const exportItems = items ?? data?.items
  if (!exportItems || exportItems.length === 0) return null

  const handleExport = () => {
    const headers = [
      "Title",
      "State",
      "Repository",
      "Labels",
      "Created",
      "Comments",
      "Score",
      "Author",
      "URL",
    ]

    const rows = exportItems.map(toCsvRow)

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      title="Export as CSV"
      className="gap-1.5 text-muted-foreground"
    >
      <Download className="size-3.5" />
      <span className="hidden sm:inline">Export</span>
    </Button>
  )
}
