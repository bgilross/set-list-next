"use client"
import React from "react"
import BaseModal from "./BaseModal"
import dynamic from "next/dynamic"

const PlaylistImporter = dynamic(() => import("../PlaylistImporter"), { ssr: false })

export default function SpotifyImportModal({ open, onClose }) {
	return (
		<BaseModal
			open={open}
			onClose={onClose}
			z={60}
			maxWidth="max-w-3xl"
			panelClass="border-green-300"
			label="Import from Spotify"
		>
			<div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-green-600 to-blue-600 rounded-t-2xl text-green-50">
				<h3 className="text-sm font-bold tracking-wide">Import from Spotify</h3>
				<button
					onClick={onClose}
					className="text-green-100 hover:text-white text-xs"
				>
					Close
				</button>
			</div>
			<div className="overflow-y-auto p-5">
				<PlaylistImporter
					onImported={() => {
						onClose()
					}}
				/>
			</div>
		</BaseModal>
	)
}
