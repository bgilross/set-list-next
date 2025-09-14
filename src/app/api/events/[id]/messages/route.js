import { prisma } from "@/lib/prismaClient"
import { NextResponse } from "next/server"
import { ensureUser, getCurrentUser } from "@/lib/authServer"

export async function GET(req, { params }) {
	const { id } = params // event id
	const messages = await prisma.message.findMany({
		where: { thread: { eventId: id } },
		orderBy: { createdAt: "asc" },
	})
	return NextResponse.json(messages)
}

export async function POST(req, { params }) {
	const { id } = params
	const user = await getCurrentUser(req)
	const body = await req.json()

	// Ensure thread exists or create for event
	let thread = await prisma.eventThread.findUnique({ where: { eventId: id } })
	if (!thread) {
		// ensure event exists
		const ev = await prisma.event.findUnique({ where: { id } })
		if (!ev)
			return NextResponse.json({ error: "Event not found" }, { status: 404 })
		thread = await prisma.eventThread.create({ data: { eventId: id } })
	}

	const message = await prisma.message.create({
		data: {
			threadId: thread.id,
			senderId: user?.id || null,
			senderType: user ? "AUDIENCE" : "SYSTEM",
			type: body.type || "TEXT",
			content: body.content || null,
			meta: body.meta || null,
		},
	})

	return NextResponse.json(message)
}
