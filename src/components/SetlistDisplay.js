"use client"

import React, { useMemo, useState } from "react"
import { useAuth } from "@/lib/AuthContext"
import SetlistPreview from "./SetlistPreview"
import { getSongsByIds } from "@/lib/logic"
const SetlistDisplay = ({ userId, setSongList, onSelectSetlist, onCreate }) => {
	const [collapsed, setCollapsed] = useState(true)
	const { setlists, setSetlists, userSongs } = useAuth()
	// Removed interactive sorting; default ordering will be Updated DESC only.

	const handleDelete = async (setlistId) => {
		try {
			const res = await fetch(
				`/api/setlists?id=${encodeURIComponent(setlistId)}`,
				{
					method: "DELETE",
					headers: { "x-artist-id": userId },
				}
			)
			const json = await res.json()
			if (res.ok && json.success) {
				setSetlists(setlists.filter((s) => s.id !== setlistId))
			} else {
				console.error("Failed to delete setlist:", json.error)
			}
		} catch (e) {
			console.error("Failed to delete setlist:", e)
		}
	}

	const handleSelectSetlist = async (setlist) => {
		// Fetch full setlist from the server to ensure songs are present
		let full = null
		try {
			const res = await fetch(
				`/api/setlists/${encodeURIComponent(setlist.id)}`,
				{
					headers: { "x-artist-id": userId },
					cache: "no-store",
				}
			)
			const json = await res.json()
			if (res.ok && json.success) {
				full = json.data
			}
		} catch {}
		const songsRaw = Array.isArray(full?.songs)
			? full.songs
			: Array.isArray(setlist.songs)
			? setlist.songs
			: []
		// Normalized fallback from stored data (used if Spotify fetch fails or IDs invalid)
		const fallback = songsRaw.map((s) => {
			const id = s.spotifyId || s.id || s.trackId || s.spotify_id || ""
			const artistName =
				s.artist || s.artistName || s.artists?.[0]?.name || "Unknown"
			const artists = s.artists?.length ? s.artists : [{ name: artistName }]
			return {
				id,
				name: s.name || s.title || "Untitled",
				artists,
				album: s.album
					? { name: s.album, release_date: s.year ? `${s.year}-01-01` : "" }
					: {
							name: s.album?.name || "",
							release_date: s.year ? `${s.year}-01-01` : "",
					  },
				duration_ms: s.duration_ms || s.duration || 0,
				userTags: s.userTags || s.tags || [],
				notes: s.notes || "",
				spotifyMatched: true,
			}
		})
		// Collect valid Spotify IDs (22 char alphanumeric)
		const spotifyIdRegex = /^[A-Za-z0-9]{22}$/
		const validIds = songsRaw
			.map((s) => s.spotifyId || s.id)
			.filter((id) => typeof id === "string" && spotifyIdRegex.test(id))
		if (validIds.length !== songsRaw.length) {
			console.warn(
				"Setlist contains invalid/missing Spotify IDs:",
				songsRaw.length - validIds.length,
				"invalid of",
				songsRaw.length
			)
		}
		let apiSongs = []
		if (validIds.length) {
			try {
				apiSongs = await getSongsByIds(validIds)
			} catch (e) {
				console.warn("Spotify track fetch failed; using fallback", e)
			}
		}
		// If API returned nothing (or partial), merge with fallback map to ensure display
		const apiMap = new Map(apiSongs.map((t) => [t.id, t]))
		const combined = fallback.map((fb) => {
			const api = fb.id ? apiMap.get(fb.id) : null
			const base = api || fb
			return {
				...base,
				// Ensure artists + artist string backward compatibility
				artist: base.artist || base.artists?.[0]?.name || fb.artists?.[0]?.name,
			}
		})
		// Merge user song metadata
		const userSongMap = new Map(
			(userSongs || []).map((s) => [s.id || s.spotifyId || s.id, s])
		)
		const merged = combined.map((song) => {
			const match = userSongMap.get(song.id)
			return {
				...song,
				userTags: match?.userTags || match?.tags || song.userTags || [],
				notes: match?.notes || song.notes || "",
			}
		})
		setSongList(merged)
		if (onSelectSetlist) {
			onSelectSetlist({ id: setlist.id, name: setlist.name })
		}
	}

	const processed = useMemo(() => {
		if (!Array.isArray(setlists)) return []
		return setlists
			.slice()
			.sort(
				(a, b) =>
					new Date(b.lastUpdated || b.dateCreated || 0) -
					new Date(a.lastUpdated || a.dateCreated || 0)
			)
	}, [setlists])

	if (!userId)
		return <div className="text-sm text-red-600">User not found.</div>
	if (!setlists)
		return <div className="text-sm text-gray-500">Loading setlists...</div>

	return (
		<div className="w-full flex flex-col gap-3 py-4">
			<div className="flex flex-wrap items-center justify-between gap-3 px-6">
				<div
					role="button"
					aria-expanded={!collapsed}
					aria-controls="setlist-grid"
					abIndex={0}
					onClick={() => {
						if (processed.length > 0) setCollapsed((c) => !c)
					}}
					onKeyDown={(e) => {
						if ((e.key === "Enter" || e.key === " ") && processed.length > 0) {
							setCollapsed((c) => !c)
						}
					}}
					className="group cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md px-1 py-1 transition-colors hover:bg-blue-100/60 active:bg-blue-200"
					title={
						processed.length > 0
							? collapsed
								? "Click to expand your setlists"
								: "Click to collapse your setlists"
							: undefined
					}
				>
					<h2 className="text-2xl font-bold text-blue-700 transition-colors group-hover:text-blue-800 group-active:text-blue-900">
						Your Setlists
					</h2>
					<p className="text-[12px] text-blue-600/70 tracking-wide group-hover:text-blue-700">
						{processed.length} setlist{processed.length !== 1 && "s"}
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => onCreate && onCreate()}
						className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold shadow"
					>
						Create New Setlist
					</button>
					{processed.length > 0 && (
						<button
							onClick={() => setCollapsed((c) => !c)}
							className="px-3 py-2 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-800 text-xs font-semibold"
						>
							{collapsed ? "Show" : "Hide"} List
						</button>
					)}
				</div>
			</div>
			{processed.length === 0 ? (
				<div className="mx-6 p-8 rounded-xl border border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-green-50 text-blue-700 text-sm text-center flex flex-col gap-4">
					<p className="text-base font-semibold">
						You haven&apos;t created any setlists yet.
					</p>
					<button
						onClick={() => onCreate && onCreate()}
						className="mx-auto px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-green-50 font-bold shadow-lg shadow-green-600/30 transition"
					>
						Create Your First Setlist
					</button>
				</div>
			) : !collapsed ? (
				<ul
					id="setlist-grid"
					className="grid gap-6 px-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
				>
					{processed.map((setlist) => (
						<li key={setlist.id}>
							<SetlistPreview
								setlist={setlist}
								handleDelete={handleDelete}
								handleSelectSetlist={handleSelectSetlist}
							/>
						</li>
					))}
				</ul>
			) : null}
		</div>
	)
}

export default SetlistDisplay
