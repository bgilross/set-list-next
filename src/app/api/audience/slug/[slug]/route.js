import { NextResponse } from "next/server"

export async function GET(_req, { params }) {
	try {
		const { prisma } = await import("@/lib/prismaClient")
		const slug = params?.slug
		if (!slug)
			return NextResponse.json({ error: "slug required" }, { status: 400 })
		const artist = await prisma.artist.findUnique({ where: { slug } })
		if (!artist)
			return NextResponse.json({ error: "not found" }, { status: 404 })
		const active = await prisma.setlist.findFirst({
			where: { artistId: artist.id, isActive: true },
		})
		return NextResponse.json({
			success: true,
			data: {
				artistId: artist.id,
				activeSetlistId: active?.id || null,
				profile: {
					displayName: artist.displayName,
					blurb: artist.publicBlurb || null,
					slug: artist.slug,
				},
			},
		})
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 })
	}
}
