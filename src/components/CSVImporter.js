"use client"
import React, { useRef, useState } from "react"
import Papa from "papaparse"
import { Button } from "@mui/material"
import { useToast } from "@/lib/ToastContext"

/* Expected CSV headers (case-insensitive):
 name, artist, album, year, tags
 tags: comma or pipe separated list of tags (e.g. tag1, tag2)
*/

function normalizeHeader(h) {
	return h.trim().toLowerCase()
}

function parseTags(raw) {
	if (!raw) return []
	return raw
		.split(/[,|]/)
		.map((t) => t.trim())
		.filter(Boolean)
}

// Construct a minimal song object compatible with existing table/editor logic.
function buildSong(row, idx) {
	return {
		id: `csv-${Date.now()}-${idx}`,
		name: row.name || "Untitled",
		artists: [{ name: row.artist || "Unknown" }],
		artist: row.artist || "Unknown",
		album: {
			name: row.album || "",
			release_date: row.year ? `${row.year}-01-01` : "",
		},
		userTags: parseTags(row.tags),
		albumName: row.album || "",
		year: row.year || "",
		notes: "",
	}
}

const CSVImporter = ({ onAddSongs, className = "" }) => {
	const fileInputRef = useRef(null)
	const { push } = useToast()
	const [parsing, setParsing] = useState(false)

	const handleFile = (file) => {
		if (!file) return
		setParsing(true)
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				setParsing(false)
				if (results.errors?.length) {
					console.error(results.errors)
					push(
						`Parse errors in CSV (showing first): ${results.errors[0].message}`,
						{ type: "error" }
					)
				}
				const rows = results.data || []
				if (!rows.length) {
					push("No rows found in CSV", { type: "warning" })
					return
				}
				// Normalize headers for flexibility
				const mapped = rows.map((r) => {
					const obj = {}
					Object.entries(r).forEach(([k, v]) => {
						obj[normalizeHeader(k)] = typeof v === "string" ? v.trim() : v
					})
					return obj
				})
				const songs = mapped.map(buildSong)
				onAddSongs(songs)
				push(`Imported ${songs.length} songs from CSV`, { type: "success" })
				if (fileInputRef.current) fileInputRef.current.value = ""
			},
			error: (err) => {
				setParsing(false)
				push(`Failed to parse CSV: ${err.message}`, { type: "error" })
			},
		})
	}

	return (
		<div
			className={`flex flex-col gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}
		>
			<div className="text-sm font-semibold text-blue-700">Import from CSV</div>
			<p className="text-xs text-blue-600 leading-relaxed">
				Columns: name, artist, album, year, tags. Tags can be comma or pipe
				separated.
			</p>
			<div className="flex items-center gap-3">
				<input
					ref={fileInputRef}
					type="file"
					accept=".csv,text/csv"
					onChange={(e) => handleFile(e.target.files?.[0])}
					className="text-sm"
					disabled={parsing}
				/>
				<Button
					variant="contained"
					size="small"
					onClick={() => fileInputRef.current?.click()}
					disabled={parsing}
					className="bg-blue-600 text-green-50"
				>
					{parsing ? "Parsing..." : "Select CSV"}
				</Button>
			</div>
		</div>
	)
}

export default CSVImporter
