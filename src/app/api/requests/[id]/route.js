import { NextResponse } from "next/server"

// PATCH /api/requests/:id  { status }
export async function PATCH(req, { params }) {
	try {
		const { id } = params
		const body = await req.json()
		const { status } = body || {}
		const firebaseUid = req.headers.get("x-artist-id") || body.artistId
		if (!firebaseUid)
			return NextResponse.json({ error: "artistId missing" }, { status: 401 })
		const { updateSongRequestStatusPg, ensureArtist } = await import(
			"@/lib/pgService"
		)
		const artist = await ensureArtist(firebaseUid, body.displayName || "Artist")
		const updated = await updateSongRequestStatusPg(artist.id, id, status)
		return NextResponse.json({ success: true, data: updated })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 })
	}
}
