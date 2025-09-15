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
