"use client"
import React from "react"
import BaseModal from "./BaseModal"
import CSVImporter from "../CSVImporter"

export default function CsvImportModal({
	open,
	onClose,
	onAddSongs,
	onSummary,
}) {
	return (
		<BaseModal
			open={open}
			onClose={onClose}
			z={55}
			maxWidth="max-w-xl"
			panelClass="border-blue-300 max-h-[80vh]"
			label="Import from CSV"
		>
			<div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-blue-600 to-green-600 rounded-t-2xl text-blue-50">
				<h3 className="text-sm font-bold tracking-wide">Import from CSV</h3>
				<button
					onClick={onClose}
					className="text-blue-100 hover:text-white text-xs"
				>
					Close
				</button>
			</div>
			<div className="overflow-y-auto p-5">
				<CSVImporter
					onAddSongs={(songs) => {
						onAddSongs(songs)
						onClose()
					}}
					onSummary={onSummary}
				/>
			</div>
		</BaseModal>
	)
}
