"use client"

import { Download } from "lucide-react"
import type { SearchResponse } from "@/lib/types"

interface ExportButtonProps {
  data: SearchResponse | undefined
  filename: string
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  if (!data || data.items.length === 0) return null

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

    const rows = data.items.map((issue) => [
      `"${issue.title.replace(/"/g, '""')}"`,
      issue.state,
      issue.repository_url.replace("https://api.github.com/repos/", ""),
      `"${issue.labels.map((l) => l.name).join(", ")}"`,
      issue.created_at,
      issue.comments,
      issue.score,
      issue.user?.login ?? "",
      issue.html_url,
    ])

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
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      title="Export as CSV"
    >
      <Download className="size-3.5" />
      Export CSV
    </button>
  )
}
