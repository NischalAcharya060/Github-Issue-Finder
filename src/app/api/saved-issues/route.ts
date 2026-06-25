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
  saved: z.boolean().optional(),
  done: z.boolean().optional(),
  status: z.string().optional(),
  prUrl: z.string().nullable().optional(),
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

  const { issueId, labels, saved, done, status, prUrl, ...snapshot } = parsed.data
  const userId = session.user.id
  const issueIdBig = BigInt(issueId)

  // Sync status and done/saved flags
  let finalStatus = status
  let finalDone = done
  let finalSaved = saved

  if (finalStatus !== undefined) {
    if (finalStatus === "DONE") {
      finalDone = true
      finalSaved = true
    } else {
      finalDone = false
      finalSaved = true
    }
  } else if (finalDone !== undefined) {
    finalStatus = finalDone ? "DONE" : "BACKLOG"
    finalSaved = true
  } else if (finalSaved !== undefined) {
    if (finalSaved === false) {
      finalStatus = "BACKLOG"
    }
  }

  // Set default values for create
  const createStatus = finalStatus ?? "BACKLOG"
  const createSaved = finalSaved ?? true
  const createDone = finalDone ?? false

  const item = await prisma.savedIssue.upsert({
    where: { userId_issueId: { userId, issueId: issueIdBig } },
    create: {
      userId,
      issueId: issueIdBig,
      ...snapshot,
      labels: labels ?? undefined,
      saved: createSaved,
      done: createDone,
      doneAt: createDone ? new Date() : null,
      status: createStatus,
      prUrl: prUrl ?? null,
    },
    update: {
      ...snapshot,
      labels: labels ?? undefined,
      ...(finalSaved !== undefined && { saved: finalSaved }),
      ...(finalDone !== undefined && { done: finalDone, doneAt: finalDone ? new Date() : null }),
      ...(finalStatus !== undefined && { status: finalStatus }),
      ...(prUrl !== undefined && { prUrl }),
    },
  })

  return NextResponse.json({ item: serializeSavedIssue(item) })
}
