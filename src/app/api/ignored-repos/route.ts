import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/ignored-repos — list all ignored repo full_names for the current user
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const items = await prisma.ignoredRepo.findMany({
    where: { userId: session.user.id },
    select: { repoFullName: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ items: items.map((r) => r.repoFullName) })
}

const addSchema = z.object({
  repoFullName: z.string().min(1).max(255),
})

// POST /api/ignored-repos — add a repo to the ignore list
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

  const parsed = addSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { repoFullName } = parsed.data

  const item = await prisma.ignoredRepo.upsert({
    where: {
      userId_repoFullName: { userId: session.user.id, repoFullName },
    },
    create: {
      userId: session.user.id,
      repoFullName,
    },
    update: {},
  })

  return NextResponse.json({ item: item.repoFullName })
}

const removeSchema = z.object({
  repoFullName: z.string().min(1).max(255),
})

// DELETE /api/ignored-repos — remove a repo from the ignore list
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: unknown = await req.json().catch(() => ({}))
  const url = new URL(req.url)
  const repoParam = url.searchParams.get("repo")
  const allParam = url.searchParams.get("all")

  if (allParam === "true") {
    await prisma.ignoredRepo.deleteMany({
      where: { userId: session.user.id },
    })
    return NextResponse.json({ success: true })
  }

  const repoFullName = repoParam || (body && typeof body === "object" && "repoFullName" in body
    ? (body as { repoFullName: string }).repoFullName
    : null)

  if (!repoFullName) {
    return NextResponse.json({ error: "repoFullName is required" }, { status: 400 })
  }

  await prisma.ignoredRepo.deleteMany({
    where: { userId: session.user.id, repoFullName },
  })

  return NextResponse.json({ success: true })
}
