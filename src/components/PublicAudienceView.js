"use client"
import { useEffect, useState, useMemo } from "react"
import { useToast } from "@/lib/ToastContext"

async function resolveSlug(slug) {
	try {
		const res = await fetch(`/api/audience/slug/${encodeURIComponent(slug)}`, {
			cache: "no-store",
		})
		const json = await res.json()
		if (res.ok && json.success) return json.data
		return null
	} catch {
		return null
	}
}

export default function PublicAudienceView({ slug }) {
	const [artistId, setArtistId] = useState(null)
	const [activeSetlistId, setActiveSetlistId] = useState(null)
	const [profile, setProfile] = useState(null)
	const [setlistDoc, setSetlistDoc] = useState(null)
	const [filter, setFilter] = useState("")
	const [status, setStatus] = useState("loading")
	const { push } = useToast()

	// Bootstrap: resolve slug, then attach listeners
	useEffect(() => {
		;(async () => {
			setStatus("loading")
			const resolved = await resolveSlug(slug)
			if (!resolved) {
				setStatus("not-found")
				return
			}
			setArtistId(resolved.artistId)
			setActiveSetlistId(resolved.activeSetlistId)
			setProfile(resolved.profile || null)

			// Load the active setlist if available
			if (resolved.activeSetlistId) {
				try {
					const r = await fetch(
						`/api/setlists/${encodeURIComponent(resolved.activeSetlistId)}`,
						{
							headers: { "x-artist-id": resolved.artistId },
							cache: "no-store",
						}
					)
					const j = await r.json()
					if (r.ok && j.success) setSetlistDoc(j.data)
				} catch {}
			}
			setStatus("ready")
			return () => {}
		})()
	}, [slug])

	const songs = useMemo(() => {
		const raw = setlistDoc?.songs || []
		if (!filter) return raw
		const f = filter.toLowerCase()
		return raw.filter(
			(s) =>
				s.name?.toLowerCase().includes(f) ||
				s.artist?.toLowerCase().includes(f) ||
				(s.userTags || s.tags || []).some((t) => t.toLowerCase().includes(f))
		)
	}, [setlistDoc, filter])

	if (status === "loading")
		return <div className="p-6 text-sm text-gray-500">Loading…</div>
	if (status === "not-found")
		return <div className="p-6 text-red-600">Artist not found.</div>

	const totalSongs = (setlistDoc?.songs || []).length

	return (
		<div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
			<header className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
				<div className="flex-1">
					<h1 className="text-3xl font-bold tracking-tight text-blue-700">
						{profile?.displayName || "Artist"}
					</h1>
					{profile?.blurb && (
						<p className="text-sm text-gray-600 mt-1">{profile.blurb}</p>
					)}
					{setlistDoc?.name && (
						<p className="mt-2 text-xs uppercase tracking-wide text-green-600 font-semibold">
							Current Setlist: {setlistDoc.name}
						</p>
					)}
				</div>
			</header>

			<div className="flex items-center gap-3">
				<input
					type="text"
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					placeholder="Search songs or artists…"
					className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
				/>
				<span className="text-xs text-gray-500">
					{songs.length} / {totalSongs}
				</span>
			</div>

			{!totalSongs ? (
				<div className="p-6 rounded-lg border border-dashed border-gray-300 text-center text-sm text-gray-500">
					No songs in this setlist.
				</div>
			) : (
				<ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden">
					{songs.map((s) => (
						<li
							key={s.spotifyId || s.id}
							className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-blue-50 transition"
						>
							<div className="min-w-0">
								<p className="font-medium text-gray-900 truncate">
									{s.name || "Untitled"}
								</p>
								<p className="text-xs text-gray-500">
									{s.artist || s.artists?.[0]?.name || ""}
								</p>
							</div>
							<button
								className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
								onClick={async () => {
									try {
										// Create request targeting this song; using artistId from resolved slug
										const res = await fetch("/api/requests", {
											method: "POST",
											headers: {
												"Content-Type": "application/json",
												"x-artist-id": artistId,
											},
											body: JSON.stringify({
												rawTitle: s.name,
												setlistId: activeSetlistId,
											}),
										})
										if (!res.ok) throw new Error("request failed")
										push("Request sent", { type: "success" })
									} catch (e) {
										push("Could not send request", { type: "error" })
									}
								}}
							>
								Request
							</button>
						</li>
					))}
				</ul>
			)}

			<footer className="pt-4 text-center text-[10px] text-gray-400">
				Audience view (reusing artist setlists)
			</footer>
		</div>
	)
}
