"use client"

import React, { useMemo, useState } from "react"
import { deleteSetlist } from "../lib/dbService" // Import functions
import { useAuth } from "@/lib/AuthContext"
import SetlistPreview from "./SetlistPreview"
import { getSongsByIds } from "@/lib/logic"
const SetlistDisplay = ({ userId, setSongList, onSelectSetlist, onCreate }) => {
	const [collapsed, setCollapsed] = useState(true)
	const { setlists, setSetlists, userSongs } = useAuth()
	// Removed interactive sorting; default ordering will be Updated DESC only.

	const handleDelete = async (setlistId) => {
		const result = await deleteSetlist(userId, setlistId)
		if (result.success) {
			setSetlists(setlists.filter((s) => s.id !== setlistId))
		} else {
			console.error("Failed to delete setlist:", result.error)
		}
	}

	const handleSelectSetlist = async (setlist) => {
		const songIds = setlist.songs.map((song) => song.spotifyId)
		const apiSongs = await getSongsByIds(songIds)
		const userSongMap = new Map(
			(userSongs || []).map((s) => [s.id || s.spotifyId || s.id, s])
		)
		const merged = apiSongs.map((song) => {
			const match = userSongMap.get(song.id)
			return {
				...song,
				userTags: match?.userTags || match?.tags || [],
				notes: match?.notes || "",
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
				<div>
					<h2 className="text-2xl font-bold text-blue-700">Your Setlists</h2>
					<p className="text-[12px] text-blue-600/70 tracking-wide">
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
				<ul className="grid gap-6 px-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
