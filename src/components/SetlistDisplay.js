"use client"

import React, { useMemo, useState } from "react"
import { deleteSetlist } from "../lib/dbService" // Import functions
import { useAuth } from "@/lib/AuthContext"
import SetlistPreview from "./SetlistPreview"
import { Paper } from "@mui/material"
import { getSongsByIds } from "@/lib/logic"
const SetlistDisplay = ({ userId, setSongList, onSelectSetlist }) => {
	const [filter, setFilter] = useState("")
	const { setlists, setSetlists, userSongs } = useAuth()

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
			.filter(
				(s) =>
					!filter.trim() ||
					s.name?.toLowerCase().includes(filter.trim().toLowerCase())
			)
	}, [setlists, filter])

	if (!userId)
		return <div className="text-sm text-red-600">User not found.</div>
	if (!setlists)
		return <div className="text-sm text-gray-500">Loading setlists...</div>

	return (
		<div className="w-full flex flex-col gap-4 py-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6">
				<h2 className="text-2xl font-bold text-blue-700">Your Setlists</h2>
				<input
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					placeholder="Filter by name..."
					className="px-3 py-2 rounded-lg border border-blue-300 bg-green-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
				/>
			</div>
			{processed.length === 0 ? (
				<div className="mx-6 p-6 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 text-blue-700 text-sm text-center">
					No setlists match your filter.
				</div>
			) : (
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
			)}
		</div>
	)
}

export default SetlistDisplay
