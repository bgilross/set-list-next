"use client"
import React, { useEffect, useState } from "react"
import BaseModal from "./BaseModal"
import { searchSpotifySongs } from "@/lib/logic"

/*
ReplaceSongModal
Props:
 - open
 - onClose
 - song: original song object
 - onReplace: (newSong) => void
Behavior: auto-fetch top similar (title + first artist) tracks; user clicks to replace.
*/

export default function ReplaceSongModal({ open, onClose, song, onReplace }) {
	const [loading, setLoading] = useState(false)
	const [results, setResults] = useState([])
	const [error, setError] = useState(null)

	useEffect(() => {
		if (!open || !song) return
		let cancelled = false
		const run = async () => {
			setLoading(true)
			setError(null)
			try {
				const query = `${song.name} ${song.artists?.[0]?.name || ""}`.trim()
				const data = await searchSpotifySongs(query)
				if (!cancelled) {
					setResults((data || []).slice(0, 5))
				}
			} catch (e) {
				if (!cancelled) setError("Search failed")
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		run()
		return () => {
			cancelled = true
		}
	}, [open, song])

	const handleReplace = (candidate) => {
		if (!candidate) return
		// preserve any userTags from original
		const merged = { ...candidate, userTags: song?.userTags || [] }
		onReplace?.(merged)
		onClose?.()
	}

	return (
		<BaseModal
			open={open}
			onClose={onClose}
			maxWidth="max-w-xl"
			label="Replace Song"
			panelClass="border-blue-300"
		>
			<div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-blue-600 to-green-600 rounded-t-2xl text-green-50">
				<h3 className="font-semibold text-sm tracking-wide">
					Select Correct Version
				</h3>
				<button
					onClick={onClose}
					className="text-green-100 hover:text-white text-xs"
				>
					Close
				</button>
			</div>
			<div className="p-5 space-y-4 overflow-y-auto">
				{song && (
					<div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-col gap-1">
						<div className="font-semibold">
							Current: {song.name} – {song.artists?.[0]?.name}
						</div>
						<div className="text-[10px] text-blue-500">
							Album: {song.album?.name} |{" "}
							{song.album?.release_date?.slice(0, 4)}
						</div>
					</div>
				)}
				<div>
					<h4 className="text-xs font-semibold text-green-700 mb-2">
						Top Similar Tracks
					</h4>
					{loading && <p className="text-[11px] text-blue-600">Searching...</p>}
					{error && <p className="text-[11px] text-red-600">{error}</p>}
					{!loading && !results.length && !error && (
						<p className="text-[11px] text-blue-500">No matches.</p>
					)}
					<ul className="space-y-2">
						{results.map((r) => (
							<li key={r.id}>
								<button
									onClick={() => handleReplace(r)}
									className="w-full text-left text-xs bg-white border border-green-200 hover:border-green-400 hover:bg-green-50 rounded-md p-2 flex flex-col"
								>
									<span className="font-semibold text-blue-800 truncate">
										{r.name}
									</span>
									<span className="text-[10px] text-blue-600 truncate">
										{r.artists.map((a) => a.name).join(", ")} • {r.album?.name}{" "}
										• {r.album?.release_date?.slice(0, 4)}
									</span>
								</button>
							</li>
						))}
					</ul>
				</div>
				<div className="flex justify-end gap-2 pt-2 border-t">
					<button
						onClick={onClose}
						className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700"
					>
						Keep Original
					</button>
				</div>
			</div>
		</BaseModal>
	)
}
