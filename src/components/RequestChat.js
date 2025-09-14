"use client"
import React, { useEffect, useState, useRef } from "react"
import { useAuth } from "@/lib/AuthContext"
import { supabase } from "@/lib/supabaseClient"

export default function RequestChat({ eventId }) {
	const { user } = useAuth()
	const [messages, setMessages] = useState([])
	const [text, setText] = useState("")
	const threadIdRef = useRef(null)

	useEffect(() => {
		if (!eventId) return
		let mounted = true

		// initial load
		const init = async () => {
			try {
				const res = await fetch(`/api/events/${eventId}/messages`)
				const data = await res.json()
				if (!mounted) return
				setMessages(data)
				if (data.length) threadIdRef.current = data[0].threadId
			} catch (e) {
				console.error(e)
			}
		}
		init()

		// Subscribe to Supabase realtime inserts on Message
		const channel = supabase
			.channel(`public:Message:event:${eventId}`)
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "Message" },
				(payload) => {
					const newMsg = payload.new
					// If threadId is known, filter; otherwise accept and rely on dedupe
					if (threadIdRef.current && newMsg.threadId !== threadIdRef.current)
						return
					setMessages((prev) => {
						if (prev.some((m) => m.id === newMsg.id)) return prev
						return [...prev, newMsg]
					})
				}
			)
			.subscribe()

		return () => {
			mounted = false
			supabase.removeChannel(channel)
		}
	}, [eventId])

	const send = async () => {
		if (!text) return
		const tempId = `tmp-${Date.now()}`
		const temp = {
			id: tempId,
			content: text,
			createdAt: new Date().toISOString(),
			senderId: user?.id || null,
		}
		setMessages((m) => [...m, temp])
		setText("")
		try {
			const res = await fetch(`/api/events/${eventId}/messages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: text }),
			})
			const saved = await res.json()
			setMessages((m) => m.map((x) => (x.id === tempId ? saved : x)))
		} catch (e) {
			setMessages((m) =>
				m.map((x) => (x.id === tempId ? { ...x, failed: true } : x))
			)
		}
	}

	return (
		<div className="border rounded p-3 bg-white">
			<div className="h-64 overflow-auto mb-2">
				{messages.map((m) => (
					<div
						key={m.id}
						className="mb-2"
					>
						<div className="text-xs text-gray-500">
							{m.senderId || "system"} •{" "}
							{new Date(m.createdAt).toLocaleTimeString()}
						</div>
						<div
							className={
								"text-sm " + (m.failed ? "text-red-500" : "text-gray-800")
							}
						>
							{m.content}
						</div>
					</div>
				))}
			</div>
			<div className="flex gap-2">
				<input
					value={text}
					onChange={(e) => setText(e.target.value)}
					className="flex-1 border rounded px-2 py-1"
				/>
				<button
					onClick={send}
					className="px-3 py-1 bg-blue-600 text-white rounded"
				>
					Send
				</button>
			</div>
		</div>
	)
}
