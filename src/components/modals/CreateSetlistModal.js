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
			maxWidth="max-w-4xl"
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
			<div className="overflow-y-auto p-6 space-y-6">
				<div className="grid md:grid-cols-3 gap-6">
					<div className="md:col-span-1 flex flex-col gap-4">
						<div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col gap-4">
							<h4 className="text-sm font-semibold text-blue-700">
								Import Options
							</h4>
							<button
								onClick={onOpenPlaylist}
								className="w-full px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-green-50 text-sm font-semibold shadow"
							>
								Import from Spotify
							</button>
							<button
								onClick={onOpenCsv}
								className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-blue-50 text-sm font-semibold shadow"
							>
								Import from CSV
							</button>
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
		</BaseModal>
	)
}
