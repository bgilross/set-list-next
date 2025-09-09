import { NextResponse } from "next/server"

export async function GET(req) {
	try {
		const firebaseUid = req.headers.get("x-artist-id")
		const displayName = req.headers.get("x-display-name") || "Artist"
		if (!firebaseUid)
			return NextResponse.json({ error: "artistId missing" }, { status: 401 })
		const [{ ensureArtist }] = await Promise.all([import("@/lib/pgService")])
		const artist = await ensureArtist(firebaseUid, displayName)
		return NextResponse.json({
			success: true,
			artist: {
				id: artist.id,
				slug: artist.slug || null,
				publicBlurb: artist.publicBlurb || null,
				displayName: artist.displayName,
			},
		})
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: e.status || 400 })
	}
}

export async function PATCH(req) {
	try {
		const body = await req.json()
		const { slug = undefined, publicBlurb = undefined } = body || {}
		const firebaseUid = req.headers.get("x-artist-id")
		const displayName = req.headers.get("x-display-name") || "Artist"
		if (!firebaseUid)
			return NextResponse.json({ error: "artistId missing" }, { status: 401 })
		const [{ prisma }] = await Promise.all([import("@/lib/prismaClient")])
		const { ensureArtistAccess } = await import("@/lib/authServer")
		const { artist } = await ensureArtistAccess(firebaseUid, displayName)

		const data = {}
		if (slug !== undefined) {
			const cleaned = String(slug || "")
				.toLowerCase()
				.trim()
			const valid = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/.test(cleaned)
			if (!cleaned || !valid)
				return NextResponse.json({ error: "invalid slug" }, { status: 400 })
			// check uniqueness
			const exists = await prisma.artist.findUnique({
				where: { slug: cleaned },
			})
			if (exists && exists.id !== artist.id)
				return NextResponse.json({ error: "slug in use" }, { status: 409 })
			data.slug = cleaned
		}
		if (publicBlurb !== undefined) data.publicBlurb = String(publicBlurb)
		const updated = await prisma.artist.update({
			where: { id: artist.id },
			data,
		})
		return NextResponse.json({
			success: true,
			artist: {
				id: updated.id,
				slug: updated.slug,
				publicBlurb: updated.publicBlurb,
				displayName: updated.displayName,
			},
		})
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: e.status || 400 })
	}
}
