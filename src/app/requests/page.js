"use client"

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/AuthContext"
import { useToast } from "@/lib/ToastContext"
import { supabase } from "@/lib/supabaseClient"

// Clean rebuilt page implementing:
// 1. Realtime test messaging (audience & artist panes) with Clear Chat
// 2. Incoming song requests list with delete option
// 3. Active setlist song table for generating requests

export default function RequestsTestPage() {
	const { user } = useAuth()
	const { push } = useToast()

	// Requests
	const [requests, setRequests] = useState([])
	const [loadingRequests, setLoadingRequests] = useState(false)

	// Messages / Chat
	const [messages, setMessages] = useState([])
	const [audienceInput, setAudienceInput] = useState("")
	const [artistInput, setArtistInput] = useState("")
	const [loadingMessages, setLoadingMessages] = useState(false)
	const threadIdRef = useRef(null)

	// Active Setlist
	const [activeSetlist, setActiveSetlist] = useState(null)
	const [loadingSetlist, setLoadingSetlist] = useState(false)
	const [setlistError, setSetlistError] = useState(null)

	const uidHeader = user?.uid || "demo-anon"

	const loadRequests = useCallback(async () => {
		if (!user?.uid) return
		setLoadingRequests(true)
		try {
			const res = await fetch(`/api/requests?status=PENDING`, {
				headers: { "x-artist-id": user.uid },
				cache: "no-store",
			})
			const json = await res.json().catch(() => ({}))
			if (res.ok && json.success) setRequests(json.data || [])
			else push(json.error || "Failed to load requests", { type: "error" })
		} catch (e) {
			push(e.message || "Failed to load requests", { type: "error" })
		} finally {
			setLoadingRequests(false)
		}
	}, [user?.uid, push])

	const loadMessages = useCallback(async () => {
		setLoadingMessages(true)
		try {
			const res = await fetch("/api/test-messages", {
				headers: { "x-user-uid": uidHeader },
				cache: "no-store",
			})
			const json = await res.json().catch(() => ({}))
			if (res.ok && json.success) {
				setMessages(json.data || [])
				if (!threadIdRef.current && json.thread)
					threadIdRef.current = json.thread.id
			} else {
				push(json.error || "Failed to load messages", { type: "error" })
			}
		} catch (e) {
			push(e.message || "Failed to load messages", { type: "error" })
		} finally {
			setLoadingMessages(false)
		}
	}, [uidHeader, push])

	const sendMessage = async (role, content) => {
		const trimmed = content.trim()
		if (!trimmed) return
		try {
			const res = await fetch("/api/test-messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-user-uid": uidHeader,
				},
				body: JSON.stringify({ role, content: trimmed }),
			})
			const json = await res.json().catch(() => ({}))
			if (!res.ok || !json.success) {
				push(json.error || "Send failed", { type: "error" })
				return
			}
			setMessages((prev) => [...prev, json.data])
			if (role === "audience") setAudienceInput("")
			if (role === "artist") setArtistInput("")
		} catch (e) {
			push(e.message || "Send failed", { type: "error" })
		}
	}

	const clearChat = async () => {
		try {
			const res = await fetch("/api/test-messages", {
				method: "DELETE",
				headers: { "x-user-uid": uidHeader },
			})
			if (res.ok) {
				setMessages([])
				push("Chat cleared", { type: "success" })
			} else push("Clear failed", { type: "error" })
		} catch (e) {
			push("Clear failed", { type: "error" })
		}
	}

	const loadActiveSetlist = useCallback(async () => {
		if (!user?.uid) return
		setLoadingSetlist(true)
		setSetlistError(null)
		try {
			const res = await fetch("/api/setlists/active", {
				headers: { "x-artist-id": user.uid },
				cache: "no-store",
			})
			const json = await res.json().catch(() => ({}))
			if (res.ok && json.success) {
				setActiveSetlist(json.data)
			} else setSetlistError(json.error || "Failed to load active setlist")
		} catch (e) {
			setSetlistError(e.message || "Failed to load active setlist")
		} finally {
			setLoadingSetlist(false)
		}
	}, [user?.uid])

	const songs = useMemo(() => activeSetlist?.songs || [], [activeSetlist])

	useEffect(() => {
		loadRequests()
		loadActiveSetlist()
	}, [loadRequests, loadActiveSetlist])
	useEffect(() => {
		loadMessages()
	}, [loadMessages])

	useEffect(() => {
		const channel = supabase
			.channel("test-messages")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "Message" },
				(payload) => {
					const msg = payload.new
						? {
								id: payload.new.id,
								content: payload.new.content,
								senderType: payload.new.senderType,
								createdAt: payload.new.createdAt,
						  }
						: null
					if (msg) setMessages((prev) => [...prev, msg])
				}
			)
			.subscribe()
		return () => {
			supabase.removeChannel(channel)
		}
	}, [])

	return (
		<div className="p-6 space-y-10">
			<section>
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-lg text-black font-semibold">
						Test Messaging Sandbox
					</h2>
					<button
						onClick={clearChat}
						className="text-xs px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600"
					>
						Clear Chat
					</button>
				</div>
				<p className="text-sm text-gray-600 mb-4">
					Realtime test chat backed by DB (Event/Message). Each logged-in user
					has an isolated thread.
				</p>
				{loadingMessages && (
					<div className="text-xs text-gray-500 mb-2">Loading messages…</div>
				)}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="border rounded p-4 bg-white flex flex-col h-80">
						<h3 className="font-medium mb-2">Audience</h3>
						<div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
							{messages.slice(-200).map((m) => {
								const isAudience = m.senderType === "AUDIENCE"
								return (
									<div
										key={m.id}
										className={`text-xs flex flex-col ${
											isAudience ? "items-start" : "items-end"
										}`}
									>
										<div
											className={`max-w-[80%] rounded px-2 py-1 mb-1 whitespace-pre-wrap break-words shadow-sm ${
												isAudience
													? "bg-blue-50 text-gray-800 border border-blue-200"
													: "bg-gray-800 text-white"
											}`}
										>
											{m.content}
										</div>
										<span className="text-[10px] text-gray-500">
											{isAudience ? "Audience" : "Artist"} •{" "}
											{new Date(m.createdAt).toLocaleTimeString()}
										</span>
									</div>
								)
							})}
						</div>
						<form
							onSubmit={(e) => {
								e.preventDefault()
								sendMessage("audience", audienceInput)
							}}
							className="mt-3 flex gap-2"
						>
							<input
								value={audienceInput}
								onChange={(e) => setAudienceInput(e.target.value)}
								placeholder="Audience message"
								className="flex-1 border rounded px-2 py-1 text-sm"
							/>
							<button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded">
								Send
							</button>
						</form>
					</div>
					<div className="border rounded p-4 bg-white flex flex-col h-80">
						<h3 className="font-medium mb-2">Artist</h3>
						<div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
							{messages.slice(-200).map((m) => {
								const isArtist = m.senderType === "ARTIST"
								return (
									<div
										key={m.id}
										className={`text-xs flex flex-col ${
											isArtist ? "items-end" : "items-start"
										}`}
									>
										<div
											className={`max-w-[80%] rounded px-2 py-1 mb-1 whitespace-pre-wrap break-words shadow-sm ${
												isArtist
													? "bg-green-600 text-white"
													: "bg-gray-100 text-gray-800 border border-gray-200"
											}`}
										>
											{m.content}
										</div>
										<span className="text-[10px] text-gray-500">
											{isArtist ? "Artist" : "Audience"} •{" "}
											{new Date(m.createdAt).toLocaleTimeString()}
										</span>
									</div>
								)
							})}
						</div>
						<form
							onSubmit={(e) => {
								e.preventDefault()
								sendMessage("artist", artistInput)
							}}
							className="mt-3 flex gap-2"
						>
							<input
								value={artistInput}
								onChange={(e) => setArtistInput(e.target.value)}
								placeholder="Artist message"
								className="flex-1 border rounded px-2 py-1 text-sm"
							/>
							<button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded">
								Send
							</button>
						</form>
					</div>
				</div>
			</section>

			{/* Active setlist songs & Request buttons */}
			<section>
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-lg text-black font-semibold">
						Active Setlist Songs
					</h2>
					<button
						onClick={loadActiveSetlist}
						className="text-xs px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
					>
						Reload
					</button>
				</div>
				{!user?.uid && (
					<div className="text-sm text-gray-600">
						Login to view active setlist.
					</div>
				)}
				{user?.uid && (
					<div>
						{loadingSetlist && (
							<div className="text-sm text-gray-500">Loading setlist…</div>
						)}
						{setlistError && !loadingSetlist && (
							<div className="text-sm text-red-600">{setlistError}</div>
						)}
						{!loadingSetlist && !setlistError && !activeSetlist && (
							<div className="text-sm text-gray-600">No active setlist.</div>
						)}
						{!loadingSetlist &&
							!setlistError &&
							activeSetlist &&
							songs.length === 0 && (
								<div className="text-sm text-gray-600">
									Active setlist has no songs.
								</div>
							)}
						{!loadingSetlist && !setlistError && songs.length > 0 && (
							<div className="rounded-lg overflow-hidden border border-gray-200">
								<table className="min-w-full text-sm">
									<thead className="bg-blue-600 text-white">
										<tr>
											<th className="px-3 py-2 text-left font-semibold">
												Song
											</th>
											<th className="px-3 py-2 text-left font-semibold">
												Artist
											</th>
											<th className="px-3 py-2"></th>
										</tr>
									</thead>
									<tbody>
										{songs.map((row) => (
											<tr
												key={row.id || row.spotifyId}
												className="odd:bg-white even:bg-gray-50"
											>
												<td className="px-3 text-black py-2 whitespace-nowrap max-w-xs truncate">
													{row.name ||
														row.title ||
														row.song?.name ||
														row.rawSongTitle ||
														"Untitled"}
												</td>
												<td className="px-3 py-2 whitespace-nowrap text-gray-600">
													{row.artist ||
														row.artistName ||
														row.artists?.[0]?.name ||
														""}
												</td>
												<td className="px-3 py-2 text-right">
													<button
														className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700"
														onClick={async () => {
															try {
																const payload = {
																	rawSongTitle: row.name,
																	setlistId: activeSetlist.id,
																	artistId: user?.uid,
																}
																const res = await fetch("/api/requests", {
																	method: "POST",
																	headers: {
																		"Content-Type": "application/json",
																		"x-artist-id": user?.uid || "",
																	},
																	body: JSON.stringify(payload),
																})
																const json = await res.json().catch(() => ({}))
																if (!res.ok || !json.success) {
																	push(json.error || "Could not send request", {
																		type: "error",
																	})
																	return
																}
																push("Request sent", { type: "success" })
																try {
																	await fetch("/api/test-messages", {
																		method: "POST",
																		headers: {
																			"Content-Type": "application/json",
																			"x-user-uid": uidHeader,
																		},
																		body: JSON.stringify({
																			role: "audience",
																			content: `Requested: ${
																				row.name || "(Untitled)"
																			}`,
																		}),
																	})
																} catch (_) {}
																loadRequests()
															} catch (e) {
																push(e.message || "Could not send request", {
																	type: "error",
																})
															}
														}}
													>
														Request
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}
			</section>
			<section>
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-lg text-black font-semibold">
						Incoming Requests
					</h2>
					<button
						onClick={loadRequests}
						className="text-xs px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
					>
						Refresh
					</button>
				</div>
				{loadingRequests ? (
					<div className="text-sm text-gray-600">Loading…</div>
				) : requests.length === 0 ? (
					<div className="text-sm text-gray-600">No requests found.</div>
				) : (
					<ul className="space-y-3">
						{requests.map((r) => (
							<li
								key={r.id}
								className="p-3 border rounded bg-white"
							>
								<div className="flex justify-between gap-4">
									<div className="min-w-0">
										<div className="font-medium text-gray-800 truncate">
											{r.song?.name ||
												r.rawSongTitle ||
												r.rawTitle ||
												"(no title)"}
										</div>
										<div className="text-xs text-gray-600">
											Created {new Date(r.createdAt).toLocaleTimeString()} •{" "}
											{r.status}
										</div>
									</div>
									<div className="flex items-center gap-2 shrink-0">
										<button
											onClick={async () => {
												try {
													const res = await fetch(`/api/requests/${r.id}`, {
														method: "DELETE",
														headers: { "x-artist-id": user?.uid || "" },
													})
													if (res.ok) {
														push("Request deleted", { type: "success" })
														loadRequests()
													} else push("Delete failed", { type: "error" })
												} catch (e) {
													push("Delete failed", { type: "error" })
												}
											}}
											className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
										>
											Delete
										</button>
									</div>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	)
}
