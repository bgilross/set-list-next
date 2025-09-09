import { NextResponse } from "next/server"

export async function GET(req, { params }) {
	try {
		const [{ getSetlistPg, ensureArtist }] = await Promise.all([
			import("@/lib/pgService"),
		])
		const firebaseUid = req.headers.get("x-artist-id")
		if (!firebaseUid)
			return NextResponse.json({ error: "artistId missing" }, { status: 401 })
		const artist = await ensureArtist(firebaseUid, "Artist")
		const setlistId = params?.id
		if (!setlistId)
			return NextResponse.json({ error: "id required" }, { status: 400 })
		const data = await getSetlistPg(artist.id, setlistId)
		if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
		return NextResponse.json({ success: true, data })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: e.status || 400 })
	}
}
