import { NextResponse } from "next/server"

export async function GET(req) {
	try {
		const [{ getCurrentUser, ensureUser }, { prisma }] = await Promise.all([
			import("@/lib/authServer"),
			import("@/lib/prismaClient"),
		])
		let user = await getCurrentUser(req)
		if (!user) {
			// Create user record on first contact using headers
			const firebaseUid = req.headers.get("x-artist-id")
			if (!firebaseUid) return NextResponse.json({ authenticated: false })
			const displayName = req.headers.get("x-display-name") || undefined
			const photoURL = req.headers.get("x-photo-url") || undefined
			user = await ensureUser(firebaseUid, { displayName, photoURL })
		}
		// Find artist mapping if exists
		const artist = await prisma.artist.findUnique({
			where: { firebaseUid: user.firebaseUid },
		})
		return NextResponse.json({
			authenticated: true,
			user: {
				id: user.id,
				displayName: user.displayName,
				photoURL: user.photoURL,
				role: user.role,
			},
			artistId: artist?.id || null,
		})
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 })
	}
}
