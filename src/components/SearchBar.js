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
		<div className="w-full">
			<div className="flex items-center gap-2 rounded-lg border border-blue-300 bg-white/80 backdrop-blur px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-green-400 transition">
				<input
					type="text"
					value={query}
					onChange={handleInputChange}
					placeholder="Search songs (min 3 chars)"
					className="w-full bg-transparent text-sm md:text-base placeholder-blue-400 text-blue-900 focus:outline-none"
				/>
				{query && query.length >= 3 && (
					<button
						onClick={() => {
							setQuery("")
							setSearchResults([])
						}}
						className="text-[10px] uppercase tracking-wide text-blue-500 hover:text-blue-700 font-semibold"
					>
						Clear
					</button>
				)}
			</div>
		</div>
	)
}
