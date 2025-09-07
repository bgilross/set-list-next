"use client"

import SearchBar from "./SearchBar"
import SearchResults from "./SearchResults"
import { useState } from "react"
import TableDisplay from "./TableDisplay"
import { Button } from "@mui/material"
import { useAuth } from "@/lib/AuthContext"
import { getSetlists } from "@/lib/dbService"
import SetlistDisplay from "./SetlistDisplay"
import dynamic from "next/dynamic"
const PlaylistImporter = dynamic(() => import("./PlaylistImporter"), {
	ssr: false,
	loading: () => (
		<div className="text-sm text-blue-600 px-6">Loading importer…</div>
	),
})

const Main = () => {
	const [searchResults, setSearchResults] = useState([])
	const [songList, setSongList] = useState([])
	const [activeSetlist, setActiveSetlist] = useState(null) // {id, name}

	const { user, setlists, userSongs } = useAuth()

	const handleClick = () => {
		console.log("user:", user)
		console.log("songList:", songList)
		console.log("searchResults:", searchResults)
		console.log("attempting to get setlist data...")
		getSetlists(user.uid)
		console.log("userSongs  :", userSongs)
	}

	return (
		<div className="flex flex-col justify-center items-center h-full bg-blue-100">
			{user?.uid && (
				<div className="w-full max-w-6xl space-y-6">
					<SetlistDisplay
						setlists={setlists}
						userId={user.uid}
						setSongList={setSongList}
						onSelectSetlist={setActiveSetlist}
					/>
					<PlaylistImporter
						onImported={(s) => console.log("Imported setlist", s)}
					/>
				</div>
			)}
			<Button onClick={handleClick}>CHECK</Button>
			<SearchBar setSearchResults={setSearchResults} />
			<SearchResults
				searchResults={searchResults}
				setSongList={setSongList}
			/>
			<TableDisplay
				songList={songList}
				activeSetlist={activeSetlist}
				clearActive={() => setActiveSetlist(null)}
			/>
		</div>
	)
}
export default Main
