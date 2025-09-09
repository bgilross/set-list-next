import { Paper } from "@mui/material"
import ScrollableText from "./ScrollableText"
import { useState } from "react"
import { useToast } from "@/lib/ToastContext"

const MAX_VISIBLE = 6

const SetlistPreview = ({
	setlist,
	handleDelete,
	handleSelectSetlist,
	onStatusChange,
	userId,
}) => {
	const [hover, setHover] = useState(false)
	const { push } = useToast()
	const [actingActive, setActingActive] = useState(false)
	const [actingPublic, setActingPublic] = useState(false)
	const songs = Array.isArray(setlist.songs) ? setlist.songs : []
	const visible = songs.slice(0, MAX_VISIBLE)
	const total =
		typeof setlist.songCount === "number" ? setlist.songCount : songs.length
	const remaining = Math.max(0, total - visible.length)

	return (
		<Paper
			elevation={4}
			onClick={() => handleSelectSetlist(setlist)}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			className={`group relative flex flex-col rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-green-100 shadow-lg transition-all duration-300 hover:shadow-2xl cursor-pointer overflow-hidden ${
				setlist.isActive
					? "border-2 border-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]"
					: "border border-blue-300/40"
			} ${
				hover && !setlist.isActive
					? "ring-2 ring-green-200/60 scale-[1.015]"
					: ""
			}`}
		>
			<div className="flex items-center justify-between px-4 py-3 bg-blue-600/40 backdrop-blur-sm">
				<h3 className="font-semibold text-lg truncate pr-2">
					{setlist.name || "Untitled"}
				</h3>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						handleDelete(setlist.id)
					}}
					className="ml-auto inline-flex items-center justify-center rounded-full bg-red-500/80 hover:bg-red-600 text-white text-xs font-bold w-6 h-6 transition-colors"
					aria-label="Delete setlist"
				>
					×
				</button>
			</div>

			<div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1">
				<div className="flex items-center gap-2 text-[10px]">
					{setlist.isActive && (
						<span className="px-2 py-0.5 rounded-full bg-green-500/80 text-white font-bold">
							Active
						</span>
					)}
					{setlist.isPublic && (
						<span className="px-2 py-0.5 rounded-full bg-blue-500/80 text-white font-bold">
							Public
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						disabled={setlist.isActive || actingActive}
						onClick={async (e) => {
							e.stopPropagation()
							if (setlist.isActive) return
							setActingActive(true)
							try {
								const res = await fetch("/api/setlists/status", {
									method: "PATCH",
									headers: {
										"Content-Type": "application/json",
										"x-artist-id": userId,
									},
									body: JSON.stringify({ id: setlist.id, isActive: true }),
								})
								const j = await res.json()
								if (res.ok && j.success) {
									onStatusChange &&
										onStatusChange(setlist.id, { isActive: true })
									push("Setlist set as Active", { type: "success" })
								} else {
									push(j.error || "Failed to set active", { type: "error" })
								}
							} catch (e) {
								push("Failed to set active", { type: "error" })
							} finally {
								setActingActive(false)
							}
						}}
						className="text-[10px] px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-green-700"
						title={setlist.isActive ? "Already Active" : "Set as Active"}
					>
						{setlist.isActive ? "Active" : actingActive ? "Setting…" : "Active"}
					</button>
					<button
						type="button"
						disabled={actingPublic}
						onClick={async (e) => {
							e.stopPropagation()
							setActingPublic(true)
							try {
								const next = !setlist.isPublic
								const res = await fetch("/api/setlists/status", {
									method: "PATCH",
									headers: {
										"Content-Type": "application/json",
										"x-artist-id": userId,
									},
									body: JSON.stringify({ id: setlist.id, isPublic: next }),
								})
								const j = await res.json()
								if (res.ok && j.success) {
									onStatusChange &&
										onStatusChange(setlist.id, { isPublic: next })
									push(next ? "Setlist published" : "Setlist unpublished", {
										type: "success",
									})
								} else {
									push(j.error || "Failed to update", { type: "error" })
								}
							} catch (e) {
								push("Failed to update", { type: "error" })
							} finally {
								setActingPublic(false)
							}
						}}
						className="text-[10px] px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
						title="Toggle Public"
					>
						{actingPublic
							? "Saving…"
							: setlist.isPublic
							? "Unpublish"
							: "Publish"}
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-0.5 px-3 pt-1 pb-3 bg-green-50/10">
				{visible.length === 0 && (
					<div className="text-xs italic text-green-200/70 py-4 text-center">
						No songs yet
					</div>
				)}
				{visible.map((song, i) => (
					<div
						key={song.spotifyId || song.id || song.name + i}
						className="grid grid-cols-2 text-[11px] md:text-xs rounded-md overflow-hidden"
					>
						<div
							className={`bg-green-100/90 px-2 py-1 text-blue-900 truncate ${
								i === 0 ? "rounded-l-md" : ""
							}`}
						>
							<ScrollableText text={song.name} />
						</div>
						<div
							className={`bg-green-100/80 px-2 py-1 text-blue-800 truncate text-right ${
								i === 0 ? "rounded-r-md" : ""
							}`}
						>
							<ScrollableText
								text={song.artist || song.artists?.[0]?.name || ""}
							/>
						</div>
					</div>
				))}
				{remaining > 0 && (
					<div className="mt-1 text-[10px] md:text-xs text-green-200/80 text-center">
						+{remaining} more …
					</div>
				)}
			</div>

			<div className="flex items-center justify-between px-3 py-2 text-[10px] md:text-xs bg-blue-700/40 border-t border-blue-400/30">
				<span>
					{total} song{total !== 1 ? "s" : ""}
				</span>
				{setlist.lastUpdated && (
					<span className="italic opacity-70">
						Updated {new Date(setlist.lastUpdated).toLocaleDateString()}
					</span>
				)}
			</div>
		</Paper>
	)
}

export default SetlistPreview
