"use client"

import { useEffect, useRef, useCallback, useState, memo } from "react"
import { searchSpotifySongs } from "@/lib/logic"
export default memo(function SearchBar({
	setSearchResults,
	autoFocus = true,
	inputRefExternal,
}) {
	const [query, setQuery] = useState("")
	const debounceRef = useRef()
	const internalInputRef = useRef(null)
	const inputRef = inputRefExternal || internalInputRef
	const wrapperRef = useRef(null)

	// stable setter wrapper
	const applyResults = useCallback(
		(results) => {
			setSearchResults(results)
		},
		[setSearchResults]
	)

	const prevLenRef = useRef(0)
	const handleInputChange = (e) => {
		const val = e.target.value
		setQuery(val)
		if (val.length < 3 && prevLenRef.current >= 3) {
			// only clear when crossing from >=3 to <3
			setSearchResults([])
		}
		prevLenRef.current = val.length
	}

	// Fire search after debounce and then re-focus if user was typing
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)
		if (!query || query.length < 3) return
		debounceRef.current = setTimeout(async () => {
			const temp = await searchSpotifySongs(query)
			applyResults(temp)
			// If focus was lost (e.g., jumps to Close button) restore it
			if (inputRef.current && document.activeElement !== inputRef.current) {
				// Avoid stealing focus if user clicked elsewhere intentionally (mouse down outside wrapper)
				// Heuristic: only refocus if previous length equals current length (still typing flow)
				inputRef.current.focus({ preventScroll: true })
			}
		}, 275)
		return () => clearTimeout(debounceRef.current)
	}, [query, applyResults, inputRef])

	// Initial focus when modal opens
	useEffect(() => {
		if (autoFocus && inputRef.current)
			inputRef.current.focus({ preventScroll: true })
	}, [autoFocus, inputRef])

	return (
		<div
			className="w-full"
			ref={wrapperRef}
		>
			<div className="flex items-center gap-2 rounded-lg border border-blue-300 bg-white/80 backdrop-blur px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-green-400 transition">
				<input
					type="text"
					value={query}
					onChange={handleInputChange}
					placeholder="Search songs (min 3 chars)"
					ref={inputRef}
					autoFocus={autoFocus}
					className="w-full bg-transparent text-sm md:text-base placeholder-blue-400 text-blue-900 focus:outline-none"
				/>
				{query && query.length >= 3 && (
					<button
						onClick={() => {
							setQuery("")
							setSearchResults([])
							prevLenRef.current = 0
							if (inputRef.current) inputRef.current.focus()
						}}
						className="text-[10px] uppercase tracking-wide text-blue-500 hover:text-blue-700 font-semibold"
					>
						Clear
					</button>
				)}
			</div>
		</div>
	)
})
