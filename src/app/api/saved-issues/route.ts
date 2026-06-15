import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { serializeSavedIssue } from "@/lib/serialize"

export const dynamic = "force-dynamic"

// GET /api/saved-issues?filter=saved|done|all
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const filter = new URL(req.url).searchParams.get("filter") ?? "all"
  const where: { userId: string; saved?: boolean; done?: boolean } = {
    userId: session.user.id,
  }
  if (filter === "saved") where.saved = true
  else if (filter === "done") where.done = true

  const items = await prisma.savedIssue.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ items: items.map(serializeSavedIssue) })
}

const labelSchema = z.object({
  name: z.string(),
  color: z.string(),
})

const upsertSchema = z.object({
  issueId: z.number().int(),
  number: z.number().int(),
  title: z.string().min(1).max(500),
  htmlUrl: z.string().url(),
  repoFullName: z.string().min(1).max(255),
  state: z.string().max(20),
  labels: z.array(labelSchema).max(50).optional(),
  // Optional flag changes. Omitted = leave as-is (default true on create).
  saved: z.boolean().optional(),
  done: z.boolean().optional(),
})

// POST /api/saved-issues — upsert save/done state for an issue
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { issueId, labels, saved, done, ...snapshot } = parsed.data
  const userId = session.user.id
  const issueIdBig = BigInt(issueId)
  const doneAt = done ? new Date() : done === false ? null : undefined

  const item = await prisma.savedIssue.upsert({
    where: { userId_issueId: { userId, issueId: issueIdBig } },
    create: {
      userId,
      issueId: issueIdBig,
      ...snapshot,
      labels: labels ?? undefined,
      saved: saved ?? true,
      done: done ?? false,
      doneAt: done ? new Date() : null,
    },
    update: {
      ...snapshot,
      labels: labels ?? undefined,
      ...(saved !== undefined && { saved }),
      ...(done !== undefined && { done, doneAt }),
    },
  })

  return NextResponse.json({ item: serializeSavedIssue(item) })
}
