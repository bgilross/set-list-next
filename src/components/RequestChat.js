"use client"
import React, { useEffect, useState, useRef } from "react"
import { useAuth } from "@/lib/AuthContext"

export default function RequestChat({ eventId }) {
	const { user } = useAuth()
	const [messages, setMessages] = useState([])
	const [text, setText] = useState("")
	const polling = useRef(null)

	const fetchMessages = async () => {
		try {
			const res = await fetch(`/api/events/${eventId}/messages`)
			const data = await res.json()
			setMessages(data)
		} catch (e) {
			console.error(e)
		}
	}

	useEffect(() => {
		if (!eventId) return
		let mounted = true
		const doFetch = async () => {
			try {
				const res = await fetch(`/api/events/${eventId}/messages`)
				const data = await res.json()
				if (mounted) setMessages(data)
			} catch (e) {
				console.error(e)
			}
		}
		doFetch()
		polling.current = setInterval(doFetch, 3000)
		return () => {
			mounted = false
			clearInterval(polling.current)
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
