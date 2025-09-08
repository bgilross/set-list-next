"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/lib/AuthContext"
import SetlistDisplay from "./SetlistDisplay"
import GuestExplore from "./GuestExplore"
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
	const [csvSummary, setCsvSummary] = useState(null)
	const [importedName, setImportedName] = useState("")

	const openCreate = useCallback(() => {
		setActiveSetlist(null)
		setSongList([])
		setSearchResults([]) // reset any prior search results when starting a new setlist
		setCreateModalOpen(true)
	}, [])

	// When user selects existing setlist, just open modal (edit mode)
	const handleSelectSetlist = useCallback((setlistMeta) => {
		setActiveSetlist(setlistMeta)
		setCreateModalOpen(true)
	}, [])

	return (
		<div className="flex flex-col justify-center items-center h-full bg-blue-100">
			{!user?.uid && <GuestExplore />}
			{user?.uid && (
				<div className="w-full max-w-6xl space-y-6">
					<SetlistDisplay
						setlists={setlists}
						userId={user.uid}
						setSongList={setSongList}
						onSelectSetlist={handleSelectSetlist}
						onCreate={openCreate}
					/>
				</div>
			)}
			<CreateSetlistModal
				open={createModalOpen}
				onClose={() => {
					setCreateModalOpen(false)
					setSearchResults([]) // clear search results on close
				}}
				onOpenPlaylist={() => setPlaylistModalOpen(true)}
				onOpenCsv={() => setCsvModalOpen(true)}
				searchResults={searchResults}
				setSearchResults={setSearchResults}
				songList={songList}
				setSongList={setSongList}
				activeSetlist={activeSetlist}
				setActiveSetlist={setActiveSetlist}
				csvSummary={csvSummary}
				importedName={importedName}
			/>
			<SpotifyImportModal
				open={playlistModalOpen}
				onClose={() => setPlaylistModalOpen(false)}
				onImportedTracks={(tracks, name) => {
					setSongList(tracks)
					setImportedName(name || "")
					setPlaylistModalOpen(false)
					if (!createModalOpen) setCreateModalOpen(true)
				}}
			/>
			<CsvImportModal
				open={csvModalOpen}
				onClose={() => setCsvModalOpen(false)}
				onAddSongs={(songs) => setSongList((prev) => [...prev, ...songs])}
				onSummary={(summary) => setCsvSummary(summary)}
			/>
			{/* Inline editor removed: editing always occurs in modal now */}
		</div>
	)
}
