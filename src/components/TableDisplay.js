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
		<div className="w-full flex flex-col justify-center items-center">
			<Paper
				elevation={3}
				className="m-4 w-[60%] rounded-lg"
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
				/>
			</Paper>
			<div className=" flex flex-col justify-center items-center gap-2">
				{!activeSetlist && (
					<Input
						value={setlistName}
						onChange={(e) => setSetlistName(e.target.value)}
						inputClassName="text-center"
						placeHolder={"Setlist Name"}
					/>
				)}
				<div className="flex gap-2">
					<Button
						className="bg-blue-500 text-green-200 font-bold ml-2 p-2 rounded-lg"
						onClick={handleSaveSetlist}
					>
						{activeSetlist ? "Update Setlist" : "Save Setlist"}
					</Button>
					{activeSetlist && (
						<Button
							className="bg-gray-400 text-white font-bold ml-2 p-2 rounded-lg"
							onClick={clearActive}
						>
							New Setlist
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
export default TableDisplay
