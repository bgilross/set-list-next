import { NextResponse } from "next/server"

// POST /api/requests  { songId?, rawTitle?, setlistId? }
export async function POST(req) {
	try {
		const body = await req.json()
		const { songId, rawTitle, setlistId } = body || {}
		// Derive artist from authenticated user (Firebase) - placeholder: expect header x-artist-id for now
		// TODO: integrate proper auth once middleware established
		const firebaseUid = req.headers.get("x-artist-id") || body.artistId
		if (!firebaseUid)
			return NextResponse.json({ error: "artistId missing" }, { status: 401 })
		const [{ createSongRequestPg }, { ensureArtistAccess }] = await Promise.all(
			[import("@/lib/pgService"), import("@/lib/authServer")]
		)
		const { artist } = await ensureArtistAccess(
			firebaseUid,
			body.displayName || "Artist"
		)
		const created = await createSongRequestPg({
			artistId: artist.id,
			songId,
			rawTitle,
			setlistId,
		})
		return NextResponse.json({ success: true, data: created })
	} catch (e) {
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
