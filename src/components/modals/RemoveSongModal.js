"use client"
import React, { useRef } from "react"
import BaseModal from "./BaseModal"

export default function RemoveSongModal({ open, onClose, song, onConfirm }) {
	const confirmRef = useRef(null)
	return (
		<BaseModal
			open={open}
			onClose={onClose}
			maxWidth="max-w-md"
			z={70}
			panelClass="border-red-300"
			label="Confirm Remove Song"
			initialFocusRef={confirmRef}
		>
			<div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-red-600 to-orange-600 rounded-t-2xl text-red-50">
				<h3 className="text-sm font-bold tracking-wide">Remove Song</h3>
				<button
					onClick={onClose}
					className="text-red-100 hover:text-white text-xs"
				>
					Close
				</button>
			</div>
			<div className="p-5 space-y-4 text-sm">
				{song ? (
					<p className="text-blue-900">
						Are you sure you want to remove
						<span className="font-semibold text-red-600"> {song.name} </span>
						by {song.artists?.[0]?.name || "Unknown Artist"} from this working
						setlist?
					</p>
				) : (
					<p>—</p>
				)}
				<div className="flex gap-3 pt-2">
					<button
						ref={confirmRef}
						onClick={() => {
							if (song) onConfirm?.(song)
						}}
						className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
					>
						Remove
					</button>
					<button
						onClick={onClose}
						className="flex-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
					>
						Cancel
					</button>
				</div>
			</div>
		</BaseModal>
	)
}
