import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const ACCENTS = ["blue", "emerald", "purple", "amber", "rose", "slate", "indigo", "teal", "orange", "pink"] as const
const THEMES = ["light", "dark", "system"] as const

const preferenceSchema = z.object({
  theme: z.enum(THEMES).optional(),
  accent: z.enum(ACCENTS).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const prefs = await prisma.userPreference.findUnique({
      where: { userId: session.user.id },
    })
    return NextResponse.json(prefs ?? { theme: "system", accent: "blue" })
  } catch {
    return NextResponse.json({ theme: "system", accent: "blue" })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = preferenceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const prefs = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...parsed.data },
      update: parsed.data,
    })
    return NextResponse.json(prefs)
  } catch {
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 })
  }
}
