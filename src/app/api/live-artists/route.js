import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismaClient"

export async function GET() {
	try {
		const artists = await prisma.artist.findMany({
			where: { setlists: { some: { isActive: true, isPublic: true } } },
			include: {
				setlists: {
					where: { isActive: true, isPublic: true },
					take: 1,
					include: {
						songs: { include: { song: true }, orderBy: { position: "asc" } },
					},
				},
			},
			orderBy: { updatedAt: "desc" },
		})

		const mapped = artists.map((a) => ({
			id: a.id,
			guid: a.id,
			displayName: a.displayName,
			name: a.name,
			bio: a.bio,
			slug: a.slug,
			setlists: (a.setlists || []).map((sl) => ({
				id: sl.id,
				name: sl.name,
				isActive: sl.isActive,
				isPublic: sl.isPublic,
				songs: (sl.songs || []).map((ss) => {
					const s = ss.song || {}
					return {
						id: s.id,
						name: s.name || "Untitled",
						artist: s.artistName || null,
						spotifyId: s.spotifyId || null,
						album: s.album || null,
						year: s.year || null,
						userTags: s.userTags || [],
						notes: s.notes || null,
					}
				}),
			})),
		}))

		return NextResponse.json({ success: true, data: mapped })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 500 })
	}
}
