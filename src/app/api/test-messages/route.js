import { NextResponse } from "next/server"
// Test messaging endpoint backed by Event / EventThread / Message tables.
// The x-user-uid header is a firebase UID; we must map it to (or create) an Artist row to satisfy FK constraints.

// GET /api/test-messages  (requires x-user-uid header)
export async function GET(req) {
	const uid = req.headers.get("x-user-uid")
	if (!uid)
		return NextResponse.json(
			{ error: "x-user-uid header required" },
			{ status: 400 }
		)
	const [{ prisma }, { ensureArtistAccess }] = await Promise.all([
		import("@/lib/prismaClient"),
		import("@/lib/authServer"),
	])
	// Ensure artist exists (maps firebaseUid -> artist.id)
	const { artist } = await ensureArtistAccess(uid, "Test User")
	// Find or create synthetic Event for this firebase user
	let event = await prisma.event.findFirst({
		where: { artistId: artist.id, name: "TEST_CHAT" },
	})
	if (!event) {
		event = await prisma.event.create({
			data: { artistId: artist.id, name: "TEST_CHAT", isLive: false },
		})
	}
	let thread = await prisma.eventThread.findUnique({
		where: { eventId: event.id },
	})
	if (!thread)
		thread = await prisma.eventThread.create({ data: { eventId: event.id } })
	const msgs = await prisma.message.findMany({
		where: { threadId: thread.id },
		orderBy: { createdAt: "asc" },
		take: 200,
	})
	// Map to simplified shape for test UI
	const data = msgs.map((m) => ({
		id: m.id,
		content: m.content,
		createdAt: m.createdAt,
		senderType: m.senderType,
		threadId: m.threadId,
	}))
	return NextResponse.json({ success: true, data, threadId: thread.id })
}

// POST /api/test-messages { role: 'audience' | 'artist', content }
// We mirror the message to the opposing role for display purposes
export async function POST(req) {
	try {
		const uid = req.headers.get("x-user-uid")
		if (!uid)
			return NextResponse.json(
				{ error: "x-user-uid header required" },
				{ status: 400 }
			)
		const body = await req.json().catch(() => ({}))
		const { role, content } = body
		if (!role || !["audience", "artist"].includes(role))
			return NextResponse.json(
				{ error: "role must be 'audience' or 'artist'" },
				{ status: 400 }
			)
		if (!content || !content.trim())
			return NextResponse.json({ error: "content required" }, { status: 400 })
		const [{ prisma }, { ensureArtistAccess }] = await Promise.all([
			import("@/lib/prismaClient"),
			import("@/lib/authServer"),
		])
		const { artist } = await ensureArtistAccess(uid, "Test User")
		let event = await prisma.event.findFirst({
			where: { artistId: artist.id, name: "TEST_CHAT" },
		})
		if (!event) {
			event = await prisma.event.create({
				data: { artistId: artist.id, name: "TEST_CHAT", isLive: false },
			})
		}
		let thread = await prisma.eventThread.findUnique({
			where: { eventId: event.id },
		})
		if (!thread)
			thread = await prisma.eventThread.create({ data: { eventId: event.id } })
		const saved = await prisma.message.create({
			data: {
				threadId: thread.id,
				senderId: role === "artist" ? artist.id : null,
				senderType: role === "artist" ? "ARTIST" : "AUDIENCE",
				type: "TEXT",
				content: content.trim(),
			},
		})
		return NextResponse.json({
			success: true,
			data: {
				id: saved.id,
				content: saved.content,
				createdAt: saved.createdAt,
				senderType: saved.senderType,
				threadId: saved.threadId,
			},
		})
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 })
	}
}

// DELETE /api/test-messages  -- clears all messages in TEST_CHAT thread for current user
export async function DELETE(req) {
	try {
		const uid = req.headers.get("x-user-uid")
		if (!uid)
			return NextResponse.json(
				{ error: "x-user-uid header required" },
				{ status: 400 }
			)
		const [{ prisma }, { ensureArtistAccess }] = await Promise.all([
			import("@/lib/prismaClient"),
			import("@/lib/authServer"),
		])
		const { artist } = await ensureArtistAccess(uid, "Test User")
		const event = await prisma.event.findFirst({
			where: { artistId: artist.id, name: "TEST_CHAT" },
		})
		if (!event) return NextResponse.json({ success: true, cleared: 0 })
		const thread = await prisma.eventThread.findUnique({
			where: { eventId: event.id },
		})
		if (!thread) return NextResponse.json({ success: true, cleared: 0 })
		const del = await prisma.message.deleteMany({
			where: { threadId: thread.id },
		})
		return NextResponse.json({ success: true, cleared: del.count })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 })
	}
}
