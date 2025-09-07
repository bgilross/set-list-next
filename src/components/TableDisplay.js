import SortableTable from "./SortableTable"
import { Paper } from "@mui/material"
import { useState, useEffect } from "react"
import { Button } from "@mui/material"
import Input from "./TextInput"
import { saveSetlist } from "@/lib/dbService"
import { useAuth } from "@/lib/AuthContext"
import { useToast } from "@/lib/ToastContext"
import TagInput from "./TagInput"

const TableDisplay = ({ songList, activeSetlist, clearActive }) => {
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

	const config = [
		{
			label: "Name",
			render: (item) => item.name,
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

	const keyFn = (item) => {
		return item.name
	}
	if (!songList || songList.length === 0) {
		return null
	}
	return (
		<div className="w-full flex flex-col gap-3">
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
							<span className="text-xs text-blue-600 truncate max-w-[160px]" title={activeSetlist.name}>
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
			<Paper elevation={3} className="w-full rounded-lg overflow-hidden">
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
				/>
			</Paper>
		</div>
	)
}
export default TableDisplay
