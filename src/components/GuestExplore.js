"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import SearchBar from "./SearchBar"
import SearchResults from "./SearchResults"
import SpotifyLogin from "./SpotifyLogin"
import GoogleLogin from "./GoogleLogin"
import TableDisplay from "./TableDisplay"
import { useAuth } from "@/lib/AuthContext"

export default function GuestExplore() {
	const { guestSetlist, setGuestSetlist } = useAuth()
	const [searchResults, setSearchResults] = useState([])
	const [songsPreview, setSongsPreview] = useState(guestSetlist?.songs || [])
	const [setlistName, setSetlistName] = useState(guestSetlist?.name || "")

	useEffect(() => {
		setGuestSetlist({ name: setlistName, songs: songsPreview })
	}, [setlistName, songsPreview, setGuestSetlist])

	const handleAddSong = useCallback((song) => {
		setSongsPreview((prev) => {
			if (prev.find((s) => s.id === song.id)) return prev
			return [...prev, song]
		})
	}, [])

	return (
		<div className="w-full max-w-5xl mx-auto px-4 py-10 sm:py-14">
			<div className="rounded-2xl overflow-hidden shadow-xl border border-white/10 backdrop-blur-md site-gradient relative">
				<div className="absolute inset-0 bg-black/30" />
				<div className="relative p-6 sm:p-10 space-y-6">
					<div className="space-y-2">
						<h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
							Explore Spotify
						</h1>
						<p className="text-white/80 text-sm sm:text-base max-w-2xl">
							Try searching for tracks below. Sign in to save setlists, import
							playlists, and build your persistent library.
						</p>
					</div>

					<div className="bg-white/70 backdrop-blur rounded-xl p-4 shadow ring-1 ring-black/10">
						<SearchBar
							setSearchResults={setSearchResults}
							autoFocus={false}
						/>
						{searchResults.length === 0 && (
							<p className="text-xs text-blue-700 mt-3">
								Enter at least 3 characters to search Spotify.
							</p>
						)}
						{searchResults.length > 0 && (
							<div className="mt-4">
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
									{searchResults.map((track) => {
										const img =
											track.album?.images?.[1] || track.album?.images?.[0]
										return (
											<button
												key={track.id}
												onClick={() => handleAddSong(track)}
												className="group text-left rounded-xl bg-white/85 hover:bg-white shadow p-3 transition border border-transparent hover:border-green-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
											>
												<div className="flex flex-col gap-2">
													<div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-green-100">
														{img ? (
															<Image
																src={img.url}
																alt={`${track.name} album art`}
																fill
																sizes="(max-width:768px) 50vw, (max-width:1200px) 25vw, 200px"
																className="object-cover transition-transform duration-300 group-hover:scale-105"
																priority={false}
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center text-[10px] text-blue-500/60 font-medium">
																No Art
															</div>
														)}
														<div className="absolute inset-0 pointer-events-none ring-1 ring-black/5 rounded-lg" />
													</div>
													<span className="font-semibold text-xs sm:text-sm text-blue-900 group-hover:text-green-700 line-clamp-2 min-h-[2.2em]">
														{track.name}
													</span>
													<span className="text-[10px] sm:text-[11px] uppercase tracking-wide text-blue-500 group-hover:text-green-600 line-clamp-1">
														{track.artists?.map((a) => a.name).join(", ")}
													</span>
												</div>
											</button>
										)
									})}
								</div>
							</div>
						)}
					</div>

					{songsPreview.length > 0 && (
						<div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-inner ring-1 ring-black/5">
							<div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
								<h2 className="text-sm font-bold text-blue-900">
									Temporary Setlist
								</h2>
								<input
									value={setlistName}
									onChange={(e) => setSetlistName(e.target.value)}
									placeholder="Name (optional)"
									className="text-xs px-2 py-1 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/70"
								/>
							</div>
							<TableDisplay
								songList={songsPreview}
								setSongList={setSongsPreview}
								activeSetlist={null}
								clearActive={() => {}}
								csvSummary={null}
							/>
							<p className="mt-2 text-[11px] text-blue-600">
								Login to save this setlist permanently. It will auto-migrate
								after login.
							</p>
						</div>
					)}

					<div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 pt-4 border-t border-white/15">
						<div className="flex-1 space-y-1">
							<h3 className="text-lg font-bold text-white">
								Create persistent setlists
							</h3>
							<p className="text-white/70 text-sm max-w-md">
								Login to build, edit, and store your setlists. Your selections
								above will reset without an account.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<SpotifyLogin />
							<GoogleLogin />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
