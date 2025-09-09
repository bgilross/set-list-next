import { NextResponse } from "next/server"

export async function POST(req) {
	try {
		const body = await req.json().catch(() => ({}))
		const firebaseUid = req.headers.get("x-artist-id") || body.firebaseUid
		if (!firebaseUid)
			return NextResponse.json(
				{ error: "firebaseUid missing" },
				{ status: 401 }
			)
		const displayName =
			body.displayName || req.headers.get("x-display-name") || "Artist"
		const { promoteToArtist } = await import("@/lib/authServer")
		const artist = await promoteToArtist(firebaseUid, displayName)
		return NextResponse.json({ success: true, artist })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: e.status || 400 })
	}
}
