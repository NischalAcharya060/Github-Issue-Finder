import type { SavedIssue, SavedRepo } from "@/lib/types"

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

/** Raw Prisma SavedRepo row (dates are Date). */
interface PrismaSavedRepo {
  id: string
  userId: string
  repoFullName: string
  name: string
  owner: string
  htmlUrl: string
  description: string | null
  language: string | null
  stargazersCount: number
  forksCount: number
  createdAt: Date
  updatedAt: Date
}

/** Convert a Prisma SavedRepo row into a JSON-safe SavedRepo (Date -> ISO). */
export function serializeSavedRepo(row: PrismaSavedRepo): SavedRepo {
  return {
    id: row.id,
    repoFullName: row.repoFullName,
    name: row.name,
    owner: row.owner,
    htmlUrl: row.htmlUrl,
    description: row.description,
    language: row.language,
    stargazersCount: row.stargazersCount,
    forksCount: row.forksCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
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
