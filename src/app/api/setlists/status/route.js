import { NextResponse } from "next/server"

// PATCH /api/setlists/status { id, isPublic?, isActive? }
export async function PATCH(req) {
	try {
		const body = await req.json()
		const { id, isPublic = undefined, isActive = undefined } = body || {}
		const firebaseUid = req.headers.get("x-artist-id")
		if (!firebaseUid)
			return NextResponse.json({ error: "artistId missing" }, { status: 401 })
		if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
		const [{ setSetlistStatusPg }, { ensureArtistAccess }] = await Promise.all([
			import("@/lib/pgService"),
			import("@/lib/authServer"),
		])
		const { artist } = await ensureArtistAccess(firebaseUid, "Artist")
		const result = await setSetlistStatusPg(artist.id, id, {
			isPublic,
			isActive,
		})
		return NextResponse.json({ success: true, data: result })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: e.status || 400 })
	}
}
