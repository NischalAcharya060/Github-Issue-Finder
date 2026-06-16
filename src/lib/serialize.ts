import type { SavedIssue } from "@/lib/types"

/** Raw Prisma SavedIssue row (issueId is BigInt, dates are Date). */
interface PrismaSavedIssue {
  id: string
  issueId: bigint
  number: number
  title: string
  htmlUrl: string
  repoFullName: string
  state: string
  labels: unknown
  saved: boolean
  done: boolean
  doneAt: Date | null
  note: string | null
  status?: string
  prUrl?: string | null
  createdAt: Date
  updatedAt: Date
}

/** Convert a Prisma SavedIssue row into a JSON-safe SavedIssue (BigInt -> number, Date -> ISO). */
export function serializeSavedIssue(row: PrismaSavedIssue): SavedIssue {
  return {
    id: row.id,
    issueId: Number(row.issueId),
    number: row.number,
    title: row.title,
    htmlUrl: row.htmlUrl,
    repoFullName: row.repoFullName,
    state: row.state,
    labels: (row.labels as SavedIssue["labels"]) ?? null,
    saved: row.saved,
    done: row.done,
    doneAt: row.doneAt ? row.doneAt.toISOString() : null,
    note: row.note,
    status: row.status ?? "BACKLOG",
    prUrl: row.prUrl ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
