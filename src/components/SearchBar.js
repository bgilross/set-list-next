"use client"

import { useEffect, useRef, useState } from "react"
import { searchSpotifySongs } from "@/lib/logic"
import SongCard from "./SongCard"
import SongTable from "./SongTable"
import BasicModal from "./ModalTest"
import { Paper } from "@mui/material"
export default function SearchBar({ setSearchResults, searchResults }) {
	const [query, setQuery] = useState("")
	const debounceRef = useRef()

	const handleInputChange = (e) => {
		setQuery(e.target.value)
		if (e.target.value.length < 3) {
			setSearchResults([])
		}
	}

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)
		if (query.length < 3) {
			setSearchResults([])
			return
		}
		debounceRef.current = setTimeout(async () => {
			const temp = await searchSpotifySongs(query)
			setSearchResults(temp)
		}, 300)
		return () => clearTimeout(debounceRef.current)
	}, [query, setSearchResults])

	return (
		<Paper
			elevation={4}
			className="flex justify-center m-6 w-[90%] p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg ring-1 ring-blue-300/40 transition-transform hover:scale-[1.02]"
		>
			<input
				type="text"
				value={query}
				onChange={handleInputChange}
				placeholder="Search for a song..."
				className="p-3 w-96 text-lg rounded-xl bg-green-50/90 text-blue-900 placeholder-blue-400 border border-blue-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent shadow-inner transition"
			/>
		</Paper>
	)
}
