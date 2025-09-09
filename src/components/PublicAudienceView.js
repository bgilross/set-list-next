"use client"
import { useEffect, useState, useMemo } from "react"
import { useToast } from "@/lib/ToastContext"
import SortableTable from "@/components/SortableTable"

async function resolveSlug(slug) {
	try {
		const res = await fetch(`/api/audience/slug/${encodeURIComponent(slug)}`, {
			cache: "no-store",
		})
		const json = await res.json()
		if (res.ok && json.success) return json.data
		return null
	} catch {
		return null
	}
}

export default function PublicAudienceView({ slug }) {
	const [artistId, setArtistId] = useState(null)
	const [activeSetlistId, setActiveSetlistId] = useState(null)
	const [profile, setProfile] = useState(null)
	const [setlistDoc, setSetlistDoc] = useState(null)
	const [filter, setFilter] = useState("")
	const [status, setStatus] = useState("loading")
	const { push } = useToast()

	useEffect(() => {
		;(async () => {
			setStatus("loading")
			const resolved = await resolveSlug(slug)
			if (!resolved) {
				setStatus("not-found")
				return
			}
			setArtistId(resolved.artistId)
			setActiveSetlistId(resolved.activeSetlistId)
			setProfile(resolved.profile || null)

			if (resolved.activeSetlistId) {
				try {
					const r = await fetch(
						`/api/setlists/${encodeURIComponent(resolved.activeSetlistId)}`,
						{
							headers: { "x-artist-guid": resolved.artistId },
							cache: "no-store",
						}
					)
					const j = await r.json()
					if (r.ok && j.success) setSetlistDoc(j.data)
				} catch {}
			}
			setStatus("ready")
		})()
	}, [slug])

	const songs = useMemo(() => {
		const raw = setlistDoc?.songs || []
		if (!filter) return raw
		const f = filter.toLowerCase()
		return raw.filter(
			(s) =>
				s.name?.toLowerCase().includes(f) ||
				s.artist?.toLowerCase().includes(f) ||
				(s.userTags || s.tags || []).some((t) => t.toLowerCase().includes(f))
		)
	}, [setlistDoc, filter])

	if (status === "loading")
		return <div className="p-6 text-sm text-gray-500">Loading…</div>
	if (status === "not-found")
		return <div className="p-6 text-red-600">Artist not found.</div>

	const totalSongs = (setlistDoc?.songs || []).length

	return (
		<div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
			<header className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
				<div className="flex-1">
					<h1 className="text-3xl font-bold tracking-tight text-blue-700">
						{profile?.displayName || "Artist"}
					</h1>
					{profile?.blurb && (
						<p className="text-sm text-gray-600 mt-1">{profile.blurb}</p>
					)}
					{setlistDoc?.name && (
						<p className="mt-2 text-xs uppercase tracking-wide text-green-600 font-semibold">
							Current Setlist: {setlistDoc.name}
						</p>
					)}
					{!activeSetlistId && (
						<p className="mt-2 text-xs text-gray-500">
							No active setlist right now.
						</p>
					)}
				</div>
			</header>

			<div className="flex items-center gap-3">
				<input
					type="text"
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					placeholder="Search songs or artists…"
					className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
				/>
				<span className="text-xs text-gray-500">
					{songs.length} / {totalSongs}
				</span>
			</div>

			{!totalSongs ? (
				<div className="p-6 rounded-lg border border-dashed border-gray-300 text-center text-sm text-gray-500">
					No songs in this setlist.
				</div>
			) : (
				<div className="rounded-lg overflow-hidden border border-gray-200">
					<SortableTable
						data={songs}
						keyFn={(row) => row.spotifyId || row.id}
						config={[
							{
								label: "Song",
								render: (row) => (
									<div className="min-w-0">
										<div className="font-medium text-gray-900 truncate">
											{row.name || "Untitled"}
										</div>
									</div>
								),
								sortValue: (row) => row.name?.toLowerCase() || "",
							},
							{
								label: "Artist",
								render: (row) => (
									<span className="text-sm text-gray-700">
										{row.artist || row.artists?.[0]?.name || ""}
									</span>
								),
								sortValue: (row) =>
									(row.artist || row.artists?.[0]?.name || "").toLowerCase(),
							},
							{
								label: "Album",
								render: (row) => (
									<span className="text-sm text-gray-600">
										{row.album || ""}
									</span>
								),
								sortValue: (row) => (row.album || "").toLowerCase(),
							},
							{
								label: "Year",
								render: (row) => (
									<span className="text-sm text-gray-600">
										{row.year || ""}
									</span>
								),
								sortValue: (row) => row.year || 0,
							},
							{
								label: "",
								render: (row) => (
									<button
										className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
										onClick={async () => {
											try {
												const res = await fetch("/api/requests", {
													method: "POST",
													headers: {
														"Content-Type": "application/json",
														"x-artist-guid": artistId,
													},
													body: JSON.stringify({
														rawTitle: row.name,
														setlistId: activeSetlistId,
													}),
												})
												if (!res.ok) throw new Error("request failed")
												push("Request sent", { type: "success" })
											} catch (e) {
												push("Could not send request", { type: "error" })
											}
										}}
									>
										Request
									</button>
								),
							},
						]}
						headerRowClassName="bg-blue-600 text-green-50"
						tableClassName="bg-white"
						sortedHeadersClassName="cursor-pointer select-none hover:bg-blue-500/80 transition-colors"
						iconClassName="mr-1 text-green-100"
						rowsClassName="p-2"
					/>
				</div>
			)}

			<footer className="pt-4 text-center text-[10px] text-gray-400">
				Audience view (reusing artist setlists)
			</footer>
		</div>
	)
}
