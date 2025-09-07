"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/lib/AuthContext"
import SetlistDisplay from "./SetlistDisplay"
import TableDisplay from "./TableDisplay"
import CreateSetlistModal from "./modals/CreateSetlistModal"
import SpotifyImportModal from "./modals/SpotifyImportModal"
import CsvImportModal from "./modals/CsvImportModal"

export default function Main() {
	const { user, setlists } = useAuth()
	const [searchResults, setSearchResults] = useState([])
	const [songList, setSongList] = useState([])
	const [activeSetlist, setActiveSetlist] = useState(null)
	const [createModalOpen, setCreateModalOpen] = useState(false)
	const [playlistModalOpen, setPlaylistModalOpen] = useState(false)
	const [csvModalOpen, setCsvModalOpen] = useState(false)

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
			<CreateSetlistModal
				open={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				onOpenPlaylist={() => setPlaylistModalOpen(true)}
				onOpenCsv={() => setCsvModalOpen(true)}
				searchResults={searchResults}
				setSearchResults={setSearchResults}
				songList={songList}
				setSongList={setSongList}
				activeSetlist={activeSetlist}
				setActiveSetlist={setActiveSetlist}
			/>
			<SpotifyImportModal
				open={playlistModalOpen}
				onClose={() => setPlaylistModalOpen(false)}
			/>
			<CsvImportModal
				open={csvModalOpen}
				onClose={() => setCsvModalOpen(false)}
				onAddSongs={(songs) => setSongList((prev) => [...prev, ...songs])}
			/>
			{activeSetlist && !createModalOpen && (
				<TableDisplay
					songList={songList}
					setSongList={setSongList}
					activeSetlist={activeSetlist}
					clearActive={() => setActiveSetlist(null)}
				/>
			)}
		</div>
	)
}
