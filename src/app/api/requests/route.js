import { NextResponse } from "next/server"

// POST /api/requests  { songId?, rawSongTitle?, rawTitle? (deprecated), setlistId? }
export async function POST(req) {
	try {
		const body = await req.json()
		const { songId, setlistId } = body || {}
		const rawSongTitle = body.rawSongTitle || body.rawTitle || null
		// Derive artist from authenticated user (Firebase) - placeholder: expect header x-artist-id for now
		// TODO: integrate proper auth once middleware established
		const artistGuid = req.headers.get("x-artist-guid") || body.artistGuid
		const firebaseUid = req.headers.get("x-artist-id") || body.artistId
		if (!artistGuid && !firebaseUid)
			return NextResponse.json(
				{ error: "artist identifier missing" },
				{ status: 401 }
			)
		const [{ createSongRequestPg }, { ensureArtistAccess }] = await Promise.all(
			[import("@/lib/pgService"), import("@/lib/authServer")]
		)
		let artistId
		if (artistGuid) {
			// If caller supplied an artist GUID (public audience), resolve to internal artist.id
			const { prisma } = await import("@/lib/prismaClient")
			// artistGuid is the public identifier we supply from live-artists; it's the artist.id
			const art = await prisma.artist.findUnique({ where: { id: artistGuid } })
			if (!art)
				return NextResponse.json({ error: "artist not found" }, { status: 404 })
			artistId = art.id
		} else {
			const { artist } = await ensureArtistAccess(
				firebaseUid,
				body.displayName || "Artist"
			)
			artistId = artist.id
		}
		const created = await createSongRequestPg({
			artistId,
			songId,
			rawSongTitle,
			setlistId,
		})
		return NextResponse.json({ success: true, data: created })
	} catch (e) {
		console.error("/api/requests error:", e)
		return NextResponse.json({ error: e.message }, { status: 400 })
	}
}

// GET /api/requests?status=PENDING
export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url)
		const status = searchParams.get("status")
		const firebaseUid =
			req.headers.get("x-artist-id") || searchParams.get("artistId")
		if (!firebaseUid)
			return NextResponse.json({ error: "artistId missing" }, { status: 401 })
		const [{ listSongRequestsPg }, { ensureArtistAccess }] = await Promise.all([
			import("@/lib/pgService"),
			import("@/lib/authServer"),
		])
		const { artist } = await ensureArtistAccess(firebaseUid, "Artist")
		const data = await listSongRequestsPg(artist.id, { status })
		return NextResponse.json({ success: true, data })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 })
	}
}
