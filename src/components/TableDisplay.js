import SortableTable from "./SortableTable"
import { Paper } from "@mui/material"
import { useState, useEffect } from "react"
import { Button } from "@mui/material"
import Input from "./TextInput"
import { saveSetlist } from "@/lib/dbService"
import ReplaceSongModal from "./modals/ReplaceSongModal"
import { useAuth } from "@/lib/AuthContext"
import { useToast } from "@/lib/ToastContext"
import TagInput from "./TagInput"

const TableDisplay = ({
	songList,
	setSongList,
	activeSetlist,
	clearActive,
	csvSummary,
}) => {
	const [setlistName, setSetlistName] = useState("")
	const { user, userSongs } = useAuth()
	const { push } = useToast()

	// If entering edit mode, preset name & hide input UI
	useEffect(() => {
		if (activeSetlist?.name) {
			setSetlistName(activeSetlist.name)
		} else if (!activeSetlist) {
			setSetlistName("")
		}
	}, [activeSetlist])

	const handleSaveSetlist = async () => {
		if (!activeSetlist && !setlistName) {
			push("Provide a setlist name", { type: "error" })
			return
		}

		if (!songList || songList.length === 0) {
			push("Add at least one song", { type: "error" })
			return
		}

		const result = await saveSetlist(
			user.uid,
			songList,
			activeSetlist?.id || null,
			activeSetlist ? activeSetlist.name : setlistName
		)

		if (result.success) {
			push(activeSetlist ? "Setlist updated" : "Setlist saved", {
				type: "success",
			})
		} else {
			push("Error saving setlist", { type: "error" })
		}

		console.log("finishing saveSetlist, updating setlist State")
	}

	// Collect unique existing tags for autocomplete
	const tagSuggestions = Array.from(
		new Set(
			(userSongs || [])
				.flatMap((s) => s.userTags || s.tags || [])
				.filter(Boolean)
				.sort()
		)
	)

	const updateSongTags = (id, tags) => {
		// mutate in place copy
		const index = songList.findIndex((s) => s.id === id)
		if (index >= 0) {
			songList[index].userTags = tags
		}
	}

	const openReplace = (song) => {
		setTargetSong(song)
		setReplaceOpen(true)
	}

	const [replaceOpen, setReplaceOpen] = useState(false)
	const [targetSong, setTargetSong] = useState(null)

	const handleSongReplace = (newSong) => {
		if (!targetSong) return
		setSongList?.((prev) => {
			return prev.map((s) => {
				if (s.id === targetSong.id) {
					// If replaced, mark as matched
					return {
						...newSong,
						spotifyMatched: true,
						userTags: s.userTags || [],
					}
				}
				return s
			})
		})
		// Adjust csvSummary unmatched count inline if present
		if (csvSummary && csvSummary.unmatched > 0 && !targetSong.spotifyMatched) {
			// Mutate summary object (parent holds state; relying on referential update not available here) -> emit event? For simplicity, attach to window for now if needed.
			csvSummary.unmatched = Math.max(0, csvSummary.unmatched - 1)
			csvSummary.matched = Math.min(csvSummary.total, csvSummary.matched + 1)
		}
	}

	const config = [
		{
			label: "Name",
			render: (item) => (
				<button
					onClick={() => openReplace(item)}
					className="text-left underline decoration-dotted underline-offset-2 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-sm"
					title="Click to choose a different version"
				>
					{item.name}
				</button>
			),
			sortValue: (item) => item.name,
		},
		{
			label: "Artist",
			render: (item) => item.artists[0].name,
			sortValue: (item) => item.artists[0].name,
		},
		{
			label: "Album",
			render: (item) => item.album.name,
			sortValue: (item) => item.album.name,
		},
		{
			label: "Year",
			render: (item) => item.album.release_date.slice(0, 4),
			sortValue: (item) => item.album.release_date.slice(0, 4),
		},
		{
			label: "Tags",
			render: (item) => (
				<div className="max-w-[220px]">
					<TagInput
						value={item.userTags || []}
						onChange={(tags) => updateSongTags(item.id, tags)}
						suggestions={tagSuggestions}
					/>
				</div>
			),
		},
	]

	const keyFn = (item) => item.id || item.name
	if (!songList || songList.length === 0) {
		return null
	}
	return (
		<div className="w-full flex flex-col gap-3">
			{csvSummary && !activeSetlist && (
				<div className="px-3 py-2 rounded-md bg-green-50 border border-green-300 text-[11px] text-green-800 flex flex-wrap items-center gap-3">
					<span className="font-semibold">Imported</span>
					{csvSummary.sourceFile && (
						<span
							className="truncate max-w-[140px]"
							title={csvSummary.sourceFile}
						>
							from &quot;{csvSummary.sourceFile}&quot;
						</span>
					)}
					<span>
						{csvSummary.matched}/{csvSummary.total} matched
						{csvSummary.unmatched > 0 && (
							<span className="text-yellow-700 font-medium ml-2">
								{csvSummary.unmatched} unmatched
							</span>
						)}
					</span>
					{csvSummary.unmatched > 0 && (
						<span className="text-[10px] text-yellow-700">
							Click a title to swap to correct Spotify version.
						</span>
					)}
				</div>
			)}
			{/* Header with left-aligned title + count, then input & buttons */}
			<div className="flex flex-col gap-2 px-1">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div className="flex items-baseline gap-3">
						<h4 className="text-sm font-semibold text-blue-700 whitespace-nowrap">
							Working Setlist
						</h4>
						<p className="text-[11px] text-blue-500 tracking-wide whitespace-nowrap">
							{songList.length} song{songList.length !== 1 && "s"}
						</p>
						{activeSetlist?.name && (
							<span
								className="text-xs text-blue-600 truncate max-w-[160px]"
								title={activeSetlist.name}
							>
								{activeSetlist.name}
							</span>
						)}
					</div>
					<div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
						{!activeSetlist && (
							<Input
								value={setlistName}
								onChange={(e) => setSetlistName(e.target.value)}
								inputClassName="text-center w-full sm:w-56"
								placeHolder="Setlist Name"
							/>
						)}
						<div className="flex items-center gap-2">
							<Button
								className="bg-blue-500 text-green-200 font-bold px-4 py-2 rounded-lg"
								onClick={handleSaveSetlist}
							>
								{activeSetlist ? "Update" : "Save"}
							</Button>
							{activeSetlist && (
								<Button
									className="bg-gray-400 text-white font-bold px-4 py-2 rounded-lg"
									onClick={clearActive}
								>
									New
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
			<Paper
				elevation={3}
				className="w-full rounded-lg overflow-hidden"
			>
				<SortableTable
					data={songList}
					config={config}
					keyFn={keyFn}
					headerRowClassName="bg-blue-600 text-green-50"
					tableClassName="bg-green-100"
					sortedHeadersClassName="cursor-pointer select-none hover:bg-blue-500/80 transition-colors"
					iconClassName="mr-1 text-green-100"
					rowsClassName="p-2"
					className="w-full rounded-lg"
					rowClassNameFn={(row) =>
						!row.spotifyMatched && row.id.startsWith("csv-")
							? "bg-yellow-100 animate-pulse"
							: ""
					}
				/>
			</Paper>
			<ReplaceSongModal
				open={replaceOpen}
				onClose={() => setReplaceOpen(false)}
				song={targetSong}
				onReplace={handleSongReplace}
			/>
		</div>
	)
}
export default TableDisplay
