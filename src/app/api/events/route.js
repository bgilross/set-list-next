import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismaClient"
import { ensureArtistAccess, getCurrentUser } from "@/lib/authServer"

// POST /api/events
export async function POST(req) {
  try {
    const caller = await getCurrentUser(req)
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // Ensure artist access (throws 403 if not artist)
    const { artist } = await ensureArtistAccess(caller.firebaseUid, caller.displayName)

    const body = await req.json().catch(() => ({}))
    const { name, startsAt, setlistId } = body
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

    const ev = await prisma.event.create({
      data: {
        artistId: artist.id,
        name,
        startsAt: startsAt ? new Date(startsAt) : null,
        setlistId: setlistId || null,
      },
    })

    return NextResponse.json({ success: true, event: ev })
  } catch (e) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 400 })
  }
}

// GET /api/events?artistId=... (if artistId omitted, use current user)
export async function GET(req) {
  try {
    const url = new URL(req.url)
    const artistIdParam = url.searchParams.get("artistId")

    // If artistId provided, try to return public events for that artist (no auth required)
    if (artistIdParam) {
      const events = await prisma.event.findMany({
        where: { artistId: artistIdParam },
        orderBy: { startsAt: "asc" },
        take: 100,
      })
      return NextResponse.json({ success: true, data: events })
    }

    // Otherwise, require authenticated artist
    const caller = await getCurrentUser(req)
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { artist } = await ensureArtistAccess(caller.firebaseUid, caller.displayName)

    const now = new Date()
    const events = await prisma.event.findMany({
      where: { artistId: artist.id, OR: [{ startsAt: null }, { startsAt: { gte: now } }] },
      orderBy: { startsAt: "asc" },
      take: 200,
      include: { setlist: { select: { id: true, name: true } } },
    })
    return NextResponse.json({ success: true, data: events })
  } catch (e) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 400 })
  }
}
