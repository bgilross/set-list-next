import { NextResponse } from "next/server"

export async function GET(req, { params }) {
	try {
		const [{ getSetlistPg, ensureArtist }] = await Promise.all([
			import("@/lib/pgService"),
		])
		const artistGuid = req.headers.get("x-artist-guid")
		const firebaseUid = req.headers.get("x-artist-id")
		if (!artistGuid && !firebaseUid)
			return NextResponse.json(
				{ error: "artist identifier missing" },
				{ status: 401 }
			)
		// Audience path: when artist primary key is provided, use it directly
		let artistId
		if (artistGuid) {
			artistId = artistGuid
		} else {
			const artist = await ensureArtist(firebaseUid, "Artist")
			artistId = artist.id
		}
		const setlistId = params?.id
		if (!setlistId)
			return NextResponse.json({ error: "id required" }, { status: 400 })
		const data = await getSetlistPg(artistId, setlistId)
		if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
		return NextResponse.json({ success: true, data })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: e.status || 400 })
	}
}
