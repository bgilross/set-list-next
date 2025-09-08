import { Modal, Box } from "@mui/material"
import { useState, useMemo } from "react"
import Image from "next/image"
import TagInput from "./TagInput"

/* Redesigned song popup for improved readability & visual consistency */
const SongModal = ({ open, handleClose, song, setSongList }) => {
	const [tags, setTags] = useState([])

	// Could extend to check if song already in list if parent passes current list; placeholder false for now
	const alreadyAdded = false

	if (!song) return null

	const cover = song?.album?.images?.[0]?.url || song?.album?.images?.[1]?.url
	const artists = song?.artists?.map((a) => a.name).join(", ")
	let year = ""
	try {
		if (song?.album?.release_date) {
			year = new Date(song.album.release_date).getFullYear()
		}
	} catch (e) {}

	function addSong() {
		if (!setSongList) return
		setSongList((prev) => {
			if (prev.find((s) => s.id === song.id)) return prev // avoid duplicates
			return [...prev, { ...song, userTags: tags }]
		})
		handleClose()
	}

	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby="song-modal-title"
			aria-describedby="song-modal-content"
		>
			<Box
				sx={{ outline: "none" }}
				className="relative w-full max-w-xl mx-auto mt-16 md:mt-24 focus:outline-none"
			>
				<div className="relative overflow-hidden rounded-2xl ring-1 ring-blue-300/40 shadow-2xl bg-gradient-to-br from-blue-900/90 via-blue-900/80 to-green-900/80 backdrop-blur-xl">
					{/* Decorative backdrop */}
					<div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.35),transparent_60%),radial-gradient(circle_at_80%_85%,rgba(255,255,255,0.25),transparent_60%)]" />
					<header className="flex items-start gap-4 p-5 pb-4">
						{cover && (
							<div className="relative shrink-0 w-28 h-28 rounded-xl overflow-hidden ring-2 ring-green-400/50 shadow-lg">
								<Image
									src={cover}
									alt="album cover"
									fill
									sizes="112px"
									className="object-cover scale-105"
								/>
								<div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-green-600/30 mix-blend-overlay" />
							</div>
						)}
						<div className="flex flex-col gap-2 min-w-0">
							<h2
								id="song-modal-title"
								className="text-lg font-semibold tracking-wide text-green-50 drop-shadow-sm line-clamp-2"
							>
								{song.name}
							</h2>
							<div className="text-[13px] font-medium text-green-100/80 truncate">
								{artists}
							</div>
							<div className="text-[11px] uppercase tracking-wider text-green-200/50 font-semibold">
								{song?.album?.name}
								{year && <span className="ml-1">• {year}</span>}
							</div>
						</div>
						<button
							onClick={handleClose}
							className="ml-auto -mr-1 -mt-1 h-8 w-8 rounded-full bg-blue-800/60 hover:bg-blue-700/70 text-green-100 hover:text-white text-xs font-bold flex items-center justify-center shadow"
							aria-label="Close"
						>
							×
						</button>
					</header>
					<div
						id="song-modal-content"
						className="px-5 pb-5 pt-1 flex flex-col gap-4"
					>
						<div className="flex flex-col gap-2">
							<label className="text-[11px] font-semibold tracking-wide uppercase text-green-200/60">
								Tags
							</label>
							<TagInput
								value={tags}
								onChange={setTags}
							/>
							<p className="text-[10px] text-green-300/40">
								Enter tag + press Enter or comma. Backspace to remove last.
							</p>
						</div>
						<div className="flex justify-end gap-3 pt-2">
							<button
								onClick={handleClose}
								className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-800/60 hover:bg-blue-700/70 text-green-50 border border-blue-300/30 shadow"
							>
								Cancel
							</button>
							<button
								onClick={addSong}
								className="px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-400 to-blue-500 text-blue-950 shadow hover:brightness-110 disabled:opacity-50 disabled:grayscale"
								disabled={alreadyAdded}
							>
								Add Song
							</button>
						</div>
					</div>
				</div>
			</Box>
		</Modal>
	)
}

export default SongModal
