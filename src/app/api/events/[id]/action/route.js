import { prisma } from "@/lib/prismaClient"
import { NextResponse } from "next/server"
import { getCurrentUser, ensureArtistAccess } from "@/lib/authServer"

export async function POST(req, { params }) {
	const { id } = params
	// Validate the caller via authServer helpers. getCurrentUser reads x-artist-id header for now.
	const caller = await getCurrentUser(req)
	if (!caller)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	// Ensure caller is an artist and get artist record
	const { artist } = await ensureArtistAccess(
		caller.firebaseUid,
		caller.displayName
	)
	const body = await req.json()

	// body.action: "startEvent" | "stopEvent" | "confirmRequest" | "rejectRequest" | etc.
	switch (body.action) {
		case "startEvent":
			await prisma.event.update({
				where: { id },
				data: { isLive: true, updatedAt: new Date() },
			})
			break
		case "stopEvent":
			await prisma.event.update({
				where: { id },
				data: { isLive: false, updatedAt: new Date() },
			})
			break
		case "confirmRequest": {
			const { requestId } = body
			await prisma.songRequest.update({
				where: { id: requestId },
				data: { status: "ACCEPTED" },
			})
			break
		}
		case "rejectRequest": {
			const { requestId } = body
			await prisma.songRequest.update({
				where: { id: requestId },
				data: { status: "REJECTED" },
			})
			break
		}
		default:
			return NextResponse.json({ error: "Unknown action" }, { status: 400 })
	}

	return NextResponse.json({ ok: true })
}
