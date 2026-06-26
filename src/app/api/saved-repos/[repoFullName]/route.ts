import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ repoFullName: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const repoFullName = decodeURIComponent((await params).repoFullName)

  await prisma.savedRepo.deleteMany({
    where: { userId: session.user.id, repoFullName },
  })

  return NextResponse.json({ ok: true })
}
