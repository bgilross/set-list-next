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
		const [{ updateSongRequestStatusPg }, { ensureArtistAccess }] =
			await Promise.all([import("@/lib/pgService"), import("@/lib/authServer")])
		const { artist } = await ensureArtistAccess(
			firebaseUid,
			body.displayName || "Artist"
		)
		const updated = await updateSongRequestStatusPg(artist.id, id, status)
		return NextResponse.json({ success: true, data: updated })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 })
	}
}

// DELETE /api/requests/:id - permanently remove a pending request owned by the artist
export async function DELETE(req, { params }) {
	try {
		const { id } = params
		const firebaseUid = req.headers.get("x-artist-id")
		if (!firebaseUid) {
			return NextResponse.json({ error: "artistId missing" }, { status: 401 })
		}
		const [{ prisma }, { ensureArtistAccess }] = await Promise.all([
			import("@/lib/prismaClient"),
			import("@/lib/authServer"),
		])
		const { artist } = await ensureArtistAccess(firebaseUid, "Artist")
		const existing = await prisma.songRequest.findUnique({ where: { id } })
		if (!existing || existing.artistId !== artist.id) {
			return NextResponse.json({ error: "Not found" }, { status: 404 })
		}
		await prisma.songRequest.delete({ where: { id } })
		return NextResponse.json({ success: true })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 })
	}
}
