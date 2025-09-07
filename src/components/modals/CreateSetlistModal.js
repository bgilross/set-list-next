"use client"
import React from "react"
import BaseModal from "./BaseModal"
import SearchBar from "../SearchBar"
import SearchResults from "../SearchResults"
import TableDisplay from "../TableDisplay"

export default function CreateSetlistModal({
	open,
	onClose,
	onOpenPlaylist,
	onOpenCsv,
	searchResults,
	setSearchResults,
	songList,
	setSongList,
	activeSetlist,
	setActiveSetlist,
}) {
	return (
		<BaseModal
			open={open}
			onClose={onClose}
			maxWidth="max-w-6xl" /* widen modal */
			z={50}
			panelClass="border-blue-200"
			label="Create New Setlist"
		>
			<div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-green-600 rounded-t-2xl text-green-50">
				<h3 className="font-bold tracking-wide">Create New Setlist</h3>
				<button
					onClick={onClose}
					className="text-green-100 hover:text-white text-sm"
				>
					Close
				</button>
			</div>
			<div className="overflow-y-auto p-6 space-y-6 flex flex-col h-full">
				{/* Import options bar */}
				<div className="flex flex-col gap-3">
					<div className="flex flex-wrap items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
						<h4 className="text-sm font-semibold text-blue-700 mr-2">Import Options</h4>
						<button
							onClick={onOpenPlaylist}
							className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-green-50 text-xs font-semibold shadow"
						>
							Spotify
						</button>
						<button
							onClick={onOpenCsv}
							className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-blue-50 text-xs font-semibold shadow"
						>
							CSV
						</button>
					</div>
				</div>
				{/* Main content stacked layout */}
				<div className="flex flex-col gap-6 flex-1">
					<div className="p-4 rounded-xl bg-green-50 border border-green-200 flex flex-col">
						<h4 className="text-sm font-semibold text-green-700 mb-3">Search & Add Songs</h4>
						<div className="mb-4">
							<SearchBar setSearchResults={setSearchResults} />
						</div>
						<div className="p-3 rounded-lg bg-white/60 border border-green-200 max-h-60 overflow-auto">
							<h5 className="text-xs font-semibold text-green-700 mb-2">Search Results</h5>
							<SearchResults
								searchResults={searchResults}
								setSongList={setSongList}
							/>
						</div>
					</div>
					<div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col flex-1 min-h-[320px]">
						{/* Heading removed (redundant with table header) */}
						<div className="flex-1 overflow-auto">
							<TableDisplay
								songList={songList}
								activeSetlist={activeSetlist}
								clearActive={() => setActiveSetlist(null)}
							/>
						</div>
					</div>
				</div>
			</div>
		</BaseModal>
	)
}
