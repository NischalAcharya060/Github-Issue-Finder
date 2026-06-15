import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { serializeSavedIssue } from "@/lib/serialize"

export const dynamic = "force-dynamic"

const patchSchema = z.object({
  saved: z.boolean().optional(),
  done: z.boolean().optional(),
  note: z.string().max(2000).nullable().optional(),
})

// PATCH /api/saved-issues/[issueId] — toggle done/saved, edit note
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ issueId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const issueId = Number((await params).issueId)
  if (!Number.isInteger(issueId)) {
    return NextResponse.json({ error: "Invalid issueId" }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { saved, done, note } = parsed.data

  const issueIdBig = BigInt(issueId)
  const existing = await prisma.savedIssue.findUnique({
    where: { userId_issueId: { userId: session.user.id, issueId: issueIdBig } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const item = await prisma.savedIssue.update({
    where: { userId_issueId: { userId: session.user.id, issueId: issueIdBig } },
    data: {
      ...(saved !== undefined && { saved }),
      ...(done !== undefined && { done, doneAt: done ? new Date() : null }),
      ...(note !== undefined && { note }),
    },
  })

  return NextResponse.json({ item: serializeSavedIssue(item) })
}

// DELETE /api/saved-issues/[issueId]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ issueId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const issueId = Number((await params).issueId)
  if (!Number.isInteger(issueId)) {
    return NextResponse.json({ error: "Invalid issueId" }, { status: 400 })
  }

  await prisma.savedIssue.deleteMany({
    where: { userId: session.user.id, issueId: BigInt(issueId) },
  })

  return NextResponse.json({ ok: true })
}
