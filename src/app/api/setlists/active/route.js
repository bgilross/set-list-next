import { NextResponse } from "next/server"

// GET /api/setlists/active  (expects header x-artist-id: firebase uid)
// Resolves/creates artist (ensureArtistAccess) then returns the active setlist with its songs
export async function GET(req) {
	try {
		const firebaseUid = req.headers.get("x-artist-id")
		if (!firebaseUid)
			return NextResponse.json(
				{ error: "x-artist-id header required" },
				{ status: 401 }
			)
		const [{ ensureArtistAccess }] = await Promise.all([
			import("@/lib/authServer"),
		])
		const { artist } = await ensureArtistAccess(firebaseUid, "Artist")
		const { prisma } = await import("@/lib/prismaClient")
		const setlist = await prisma.setlist.findFirst({
			where: { artistId: artist.id, isActive: true },
			include: {
				songs: {
					orderBy: { position: "asc" },
					include: { song: true },
				},
			},
		})
		if (!setlist) return NextResponse.json({ success: true, data: null })
		// Normalize songs to flat array of song objects keeping position
		const normalized = {
			id: setlist.id,
			name: setlist.name,
			isActive: setlist.isActive,
			isPublic: setlist.isPublic,
			songs: setlist.songs.map((ss) => ({
				id: ss.song.id,
				name: ss.song.name,
				artist: ss.song.artistName || null,
				spotifyId: ss.song.spotifyId,
				album: ss.song.album,
				year: ss.song.year,
				position: ss.position,
				// raw original fields if needed
				artistName: ss.song.artistName,
			})),
		}
		return NextResponse.json({ success: true, data: normalized })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 })
	}
}
