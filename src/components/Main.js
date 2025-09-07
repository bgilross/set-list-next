"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/AuthContext"
import SetlistDisplay from "./SetlistDisplay"
import SearchBar from "./SearchBar"
import SearchResults from "./SearchResults"
import TableDisplay from "./TableDisplay"
import CSVImporter from "./CSVImporter"

const PlaylistImporter = dynamic(() => import("./PlaylistImporter"), {
	ssr: false,
	loading: () => (
		<div className="text-sm text-blue-600 px-6">Loading importer…</div>
	),
})

export default function Main() {
	const { user, setlists } = useAuth()
	const [searchResults, setSearchResults] = useState([])
	const [songList, setSongList] = useState([])
	const [activeSetlist, setActiveSetlist] = useState(null)
	const [createModalOpen, setCreateModalOpen] = useState(false)
	const [playlistModalOpen, setPlaylistModalOpen] = useState(false)

	useEffect(() => {
		const onKey = (e) => {
			if (e.key === "Escape") {
				if (playlistModalOpen) setPlaylistModalOpen(false)
				else if (createModalOpen) setCreateModalOpen(false)
			}
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	}, [createModalOpen, playlistModalOpen])

	const openCreate = useCallback(() => {
		setActiveSetlist(null)
		setSongList([])
		setCreateModalOpen(true)
	}, [])

	return (
		<div className="flex flex-col justify-center items-center h-full bg-blue-100">
			{user?.uid && (
				<div className="w-full max-w-6xl space-y-6">
					<SetlistDisplay
						setlists={setlists}
						userId={user.uid}
						setSongList={setSongList}
						onSelectSetlist={setActiveSetlist}
						onCreate={openCreate}
					/>
				</div>
			)}

			{createModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"
						onClick={() => setCreateModalOpen(false)}
					/>
					<div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-blue-200 flex flex-col max-h-[85vh]">
						<div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-green-600 rounded-t-2xl text-green-50">
							<h3 className="font-bold tracking-wide">Create New Setlist</h3>
							<button
								onClick={() => setCreateModalOpen(false)}
								className="text-green-100 hover:text-white text-sm"
							>
								Close
							</button>
						</div>
						<div className="overflow-y-auto p-6 space-y-6">
							<div className="grid md:grid-cols-3 gap-6">
								<div className="md:col-span-1 flex flex-col gap-4">
									<div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col gap-4">
										<h4 className="text-sm font-semibold text-blue-700">
											Import Options
										</h4>
										<button
											onClick={() => setPlaylistModalOpen(true)}
											className="w-full px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-green-50 text-sm font-semibold shadow"
										>
											Import from Spotify
										</button>
										<CSVImporter
											onAddSongs={(songs) =>
												setSongList((prev) => [...prev, ...songs])
											}
										/>
									</div>
								</div>
								<div className="md:col-span-2 flex flex-col gap-4">
									<div className="p-4 rounded-xl bg-green-50 border border-green-200">
										<h4 className="text-sm font-semibold text-green-700 mb-3">
											Search & Add Songs
										</h4>
										<div className="mb-4">
											<SearchBar setSearchResults={setSearchResults} />
										</div>
										<div className="p-3 rounded-lg bg-white/60 border border-green-200">
											<h5 className="text-xs font-semibold text-green-700 mb-2">
												Search Results
											</h5>
											<SearchResults
												searchResults={searchResults}
												setSongList={setSongList}
											/>
										</div>
									</div>
									<div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
										<h4 className="text-sm font-semibold text-blue-700 mb-2">
											Working Setlist
										</h4>
										<TableDisplay
											songList={songList}
											activeSetlist={activeSetlist}
											clearActive={() => setActiveSetlist(null)}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{playlistModalOpen && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-blue-950/70 backdrop-blur-sm"
						onClick={() => setPlaylistModalOpen(false)}
					/>
					<div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-green-300 max-h-[85vh] flex flex-col">
						<div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-green-600 to-blue-600 rounded-t-2xl text-green-50">
							<h3 className="text-sm font-bold tracking-wide">
								Import from Spotify
							</h3>
							<button
								onClick={() => setPlaylistModalOpen(false)}
								className="text-green-100 hover:text-white text-xs"
							>
								Close
							</button>
						</div>
						<div className="overflow-y-auto p-5">
							<PlaylistImporter
								onImported={() => {
									setPlaylistModalOpen(false)
								}}
							/>
						</div>
					</div>
				</div>
			)}

			{activeSetlist && !createModalOpen && (
				<TableDisplay
					songList={songList}
					activeSetlist={activeSetlist}
					clearActive={() => setActiveSetlist(null)}
				/>
			)}
		</div>
	)
}
