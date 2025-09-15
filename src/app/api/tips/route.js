import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismaClient"
import { getCurrentUser, ensureArtistAccess } from "@/lib/authServer"

export async function GET(req) {
  try {
    const caller = await getCurrentUser(req)
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { artist } = await ensureArtistAccess(caller.firebaseUid, caller.displayName)

    // Sum tipCents from song requests for this artist using Prisma aggregate
    const agg = await prisma.songRequest.aggregate({
      where: { artistId: artist.id },
      _sum: { tipCents: true },
    })
    const totalFromRequests = Number(agg._sum?.tipCents || 0)

    return NextResponse.json({ success: true, totalCents: totalFromRequests })
  } catch (e) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 400 })
  }
}
