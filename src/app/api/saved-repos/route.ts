import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { serializeSavedRepo } from "@/lib/serialize"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const items = await prisma.savedRepo.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ items: items.map(serializeSavedRepo) })
}

const createSchema = z.object({
  repoFullName: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  owner: z.string().min(1).max(255),
  htmlUrl: z.string().url(),
  description: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  stargazersCount: z.number().int(),
  forksCount: z.number().int(),
})

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

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const item = await prisma.savedRepo.upsert({
    where: {
      userId_repoFullName: { userId: session.user.id, repoFullName: parsed.data.repoFullName },
    },
    create: { userId: session.user.id, ...parsed.data },
    update: {
      name: parsed.data.name,
      owner: parsed.data.owner,
      htmlUrl: parsed.data.htmlUrl,
      description: parsed.data.description ?? null,
      language: parsed.data.language ?? null,
      stargazersCount: parsed.data.stargazersCount,
      forksCount: parsed.data.forksCount,
    },
  })

  return NextResponse.json({ item: serializeSavedRepo(item) })
}
