"use client"
import React, { useRef, useState } from "react"
import Papa from "papaparse"
import { Button } from "@mui/material"
import { useToast } from "@/lib/ToastContext"
import { searchSpotifySongs } from "@/lib/logic"

/* Accepted CSV headers (case-insensitive):
 name OR title (either works for song title), artist (required for matching), optional: album, year, tags.
 tags: comma or pipe separated list of tags (e.g. tag1, tag2)
 File can contain only Title + Artist and still import.
 A first data row that literally equals title,artist (duplicate header) will be ignored.
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

const CSVImporter = ({ onAddSongs, onSummary, className = "" }) => {
	const fileInputRef = useRef(null)
	const { push } = useToast()
	const [parsing, setParsing] = useState(false)
	const [fileName, setFileName] = useState("")
	const [autoMatch, setAutoMatch] = useState(true)
	const [matching, setMatching] = useState(false)
	const [matchProgress, setMatchProgress] = useState({ done: 0, total: 0 })

	function normalize(str) {
		return (str || "")
			.toLowerCase()
			.replace(/\([^)]*\)/g, "")
			.replace(/\[[^)]*\]/g, "")
			.replace(/[^a-z0-9\s]/g, "")
			.replace(/\s+/g, " ")
			.trim()
	}

	function isBase62Id(id) {
		return /^[A-Za-z0-9]{22}$/.test(id)
	}

	async function attemptAutoMatch(songs) {
		setMatching(true)
		setMatchProgress({ done: 0, total: songs.length })
		let matchedCount = 0
		for (let i = 0; i < songs.length; i++) {
			const s = songs[i]
			const query = `${s.name} ${s.artists?.[0]?.name || s.artist || ""}`.trim()
			if (!query) {
				setMatchProgress((p) => ({ ...p, done: p.done + 1 }))
				continue
			}
			try {
				const results = await searchSpotifySongs(query)
				if (Array.isArray(results) && results.length) {
					// Pick first plausible match
					const normTitle = normalize(s.name)
					const normArtist = normalize(s.artists?.[0]?.name || s.artist)
					let best = null
					for (const track of results) {
						const tTitle = normalize(track.name)
						const tArtists = normalize(
							track.artists?.map((a) => a.name).join(" ")
						)
						const titleScore = similarity(normTitle, tTitle)
						const artistScore = similarity(normArtist, tArtists)
						const combined = titleScore * 0.6 + artistScore * 0.4
						if (!best || combined > best.score) {
							best = { track, score: combined }
						}
					}
					if (best && best.score >= 0.55 && isBase62Id(best.track.id)) {
						// Attach Spotify data
						s.id = best.track.id
						s.spotifyMatched = true
						s.artists = best.track.artists
						s.artist = best.track.artists?.[0]?.name || s.artist
						s.album = best.track.album
						s.albumName = best.track.album?.name || s.albumName
						s.year = best.track.album?.release_date?.slice(0, 4) || s.year
						matchedCount++
					}
				}
			} catch (err) {
				console.error("Match error", err)
			}
			setMatchProgress((p) => ({ ...p, done: p.done + 1 }))
			// Small delay to avoid hammering API
			await new Promise((r) => setTimeout(r, 120))
		}
		setMatching(false)
		if (matchedCount) {
			push(`Matched ${matchedCount}/${songs.length} songs to Spotify`, {
				type: "success",
			})
		} else {
			push("No Spotify matches found (you can link manually later)", {
				type: "info",
			})
		}
		return matchedCount
	}

	// Simple similarity (Dice coefficient variant over word tokens)
	function similarity(a, b) {
		if (!a || !b) return 0
		if (a === b) return 1
		const aTokens = Array.from(new Set(a.split(" ").filter(Boolean)))
		const bTokens = Array.from(new Set(b.split(" ").filter(Boolean)))
		if (!aTokens.length || !bTokens.length) return 0
		let overlap = 0
		for (const t of aTokens) if (bTokens.includes(t)) overlap++
		return overlap / Math.max(aTokens.length, bTokens.length)
	}

	const handleFile = (file) => {
		if (!file) return
		setFileName(file.name)
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
				// Normalize headers + alias support ("title" -> "name")
				let mapped = rows.map((r) => {
					const obj = {}
					Object.entries(r).forEach(([k, v]) => {
						obj[normalizeHeader(k)] = typeof v === "string" ? v.trim() : v
					})
					if (obj.title && !obj.name) obj.name = obj.title
					return obj
				})
				// Filter out accidental duplicate header row if present in data (e.g. when user leaves header option on twice)
				mapped = mapped.filter(
					(r, idx) =>
						!(
							idx === 0 &&
							[r.name, r.title].includes("title") &&
							r.artist === "artist"
						)
				)
				const songs = mapped.map(buildSong)
				const finish = (finalSongs, matchedCount = 0) => {
					onAddSongs(finalSongs)
					onSummary?.({
						sourceFile: fileName,
						total: finalSongs.length,
						matched: matchedCount,
						unmatched: finalSongs.length - matchedCount,
						importedAt: Date.now(),
					})
					push(`Imported ${finalSongs.length} songs from CSV`, {
						type: "success",
					})
					if (fileInputRef.current) fileInputRef.current.value = ""
					setFileName("")
				}
				if (autoMatch) {
					attemptAutoMatch(songs).then((matchedCount) =>
						finish(songs, matchedCount)
					)
				} else {
					finish(songs, 0)
				}
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
				Minimum columns: title (or name) & artist. Optional: album, year, tags
				(comma or | separated). First line of real data that accidentally
				repeats the header is ignored.
			</p>
			<div className="flex items-center gap-3">
				<input
					ref={fileInputRef}
					type="file"
					accept=".csv,text/csv"
					onChange={(e) => handleFile(e.target.files?.[0])}
					className="hidden"
					aria-hidden="true"
					disabled={parsing || matching}
				/>
				<Button
					variant="contained"
					size="small"
					onClick={() => fileInputRef.current?.click()}
					disabled={parsing || matching}
					className="bg-blue-600 text-green-50"
				>
					{parsing
						? "Parsing..."
						: matching
						? `Matching ${matchProgress.done}/${matchProgress.total}`
						: "Select CSV"}
				</Button>
				{fileName && (
					<span
						className="text-xs text-blue-700 truncate max-w-[180px]"
						title={fileName}
					>
						{fileName}
					</span>
				)}
			</div>
			<label className="flex items-center gap-2 text-xs text-blue-700 mt-1 select-none">
				<input
					type="checkbox"
					checked={autoMatch}
					onChange={(e) => setAutoMatch(e.target.checked)}
					disabled={parsing || matching}
				/>
				<span>Attempt Spotify ID auto-match</span>
			</label>
			{matching && (
				<div className="text-[10px] text-blue-600 mt-1">
					Matching tracks… {matchProgress.done}/{matchProgress.total}
				</div>
			)}
		</div>
	)
}

export default CSVImporter
