"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/AuthContext"
import { saveSetlist } from "@/lib/dbService"
const USE_PRISMA_DB = process.env.NEXT_PUBLIC_USE_PRISMA_DB === 'true'

/* Contract:
 * Shows user's Spotify playlists (paginated), allows selecting one, preview tracks, and import as setlist.
 */
export default function PlaylistImporter({ onImported, onImportedTracks }) {
	const { user, setlists, setSetlists } = useAuth()
	const [playlists, setPlaylists] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [nextOffset, setNextOffset] = useState(0)
	const [hasMore, setHasMore] = useState(true)
	const [selected, setSelected] = useState(null)
	const [tracks, setTracks] = useState([])
	const [importing, setImporting] = useState(false)
	const [importName, setImportName] = useState("")
	const [collapsed, setCollapsed] = useState(false)
	const [firstLoaded, setFirstLoaded] = useState(false)

	useEffect(() => {
		if (user?.provider === "spotify" || user?.uid?.startsWith("spotify_")) {
			if (!playlists.length) fetchPlaylists(0)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

	async function fetchPlaylists(offset = 0) {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(
				`/api/spotify/playlists?limit=20&offset=${offset}`
			)
			if (!res.ok) throw new Error("failed to load playlists")
			const data = await res.json()
			const newItems = data.items || []
			setPlaylists((prev) => (offset === 0 ? newItems : [...prev, ...newItems]))
			setHasMore(!!data.next)
			setNextOffset(offset + newItems.length)
			if (offset === 0) setFirstLoaded(true)
			if (offset > 0) {
				// Auto collapse after extending list to save vertical space
				setCollapsed(true)
			}
		} catch (e) {
			setError(e.message)
		} finally {
			setLoading(false)
		}
	}

	async function selectPlaylist(pl) {
		setSelected(pl)
		setTracks([])
		setImportName(pl.name)
		await fetchTracks(pl.id)
	}

	async function fetchTracks(id) {
		try {
			const res = await fetch(`/api/spotify/playlist/${id}/tracks?limit=100`)
			if (!res.ok) throw new Error("failed tracks")
			const data = await res.json()
			const mapped = (data.items || [])
				.map((it) => {
					const t = it.track
					return {
						id: t.id,
						name: t.name,
						artists: t.artists,
						album: t.album,
						duration_ms: t.duration_ms,
						uri: t.uri,
						userTags: [],
						notes: "",
					}
				})
				.filter((t) => t.id)
			setTracks(mapped)
		} catch (e) {
			setError(e.message)
		}
	}

	async function handleImport() {
		if (!user || !tracks.length) return
		setImporting(true)
		try {
			if (USE_PRISMA_DB) {
				const finalName = importName || selected.name
				const res = await fetch('/api/setlists', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-artist-id': user.uid },
					body: JSON.stringify({ name: finalName, songs: tracks })
				})
				if (!res.ok) throw new Error('save failed')
				const json = await res.json()
				if (!json.success) throw new Error(json.error || 'save failed')
				const newSetlist = json.data
				setSetlists((prev) => [newSetlist, ...prev])
				onImported && onImported(newSetlist)
				onImportedTracks && onImportedTracks(tracks, finalName)
				setSelected(null)
				setTracks([])
			} else {
				const resp = await saveSetlist(
					user.uid,
					tracks,
					null,
					importName || selected.name
				)
				if (resp.success) {
					const finalName = importName || selected.name
					const normalizedSongs = tracks.map((t) => ({
						...t,
						artist: t.artists?.[0]?.name || t.artist,
					}))
					const newSetlist = {
						id: `temp_${Date.now()}`,
						name: finalName,
						songs: normalizedSongs,
					}
					setSetlists((prev) => {
						const exists = prev.find(
							(s) =>
								s.name === newSetlist.name &&
							(s.songs?.length || 0) === newSetlist.songs.length
						)
						if (exists) return prev
						return [newSetlist, ...prev]
					})
					onImported && onImported(newSetlist)
					onImportedTracks && onImportedTracks(tracks, finalName)
					setSelected(null)
					setTracks([])
				}
			}
		} catch (e) {
			setError(e.message)
		} finally {
			setImporting(false)
		}
	}

	// Tag editing removed here; tags can be managed after import in working setlist

	if (!user) return null

	return (
		<div className="relative overflow-hidden rounded-2xl p-5 space-y-5 bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 border border-blue-300/40 shadow-xl">
			<div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.4),transparent_60%)]" />
			<div className="relative flex items-center justify-between">
				<h3 className="text-xl font-semibold tracking-wide text-green-50 drop-shadow-sm">
					Import from Spotify Playlist
				</h3>
				<button
					type="button"
					onClick={() => setCollapsed((c) => !c)}
					className="text-xs px-3 py-1.5 rounded-full bg-blue-900/40 hover:bg-blue-900/60 border border-blue-300/40 text-green-50 font-medium"
				>
					{collapsed ? "Expand" : "Collapse"}
				</button>
			</div>
			{error && (
				<div className="relative text-red-200 text-sm bg-red-900/40 border border-red-400/40 rounded px-2 py-1">
					{error}
				</div>
			)}
			{!selected && !collapsed && (
				<div className="relative space-y-3">
					<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{playlists.map((pl) => (
							<button
								key={pl.id}
								onClick={() => selectPlaylist(pl)}
								className="group relative rounded-xl overflow-hidden ring-1 ring-blue-300/30 bg-blue-800/40 hover:bg-blue-700/50 transition-all backdrop-blur-sm flex flex-col"
							>
								{pl.images?.[0] && (
									<div className="relative w-full aspect-square overflow-hidden">
										<Image
											src={pl.images[0].url}
											alt="cover"
											fill
											sizes="(max-width:768px) 50vw, 25vw"
											className="object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
										/>
										<div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-900/40 to-blue-950/70" />
									</div>
								)}
								<div className="p-3 flex flex-col gap-1 text-left">
									<div className="font-medium text-green-50/90 group-hover:text-white line-clamp-1 drop-shadow">
										{pl.name}
									</div>
									<div className="text-[11px] uppercase tracking-wide text-green-100/60 font-semibold">
										{pl.tracks?.total || 0} tracks
									</div>
								</div>
								<span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-green-500/80 text-blue-900 font-bold shadow-sm">
									Select
								</span>
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/10" />
							</button>
						))}
					</div>
					{(hasMore || !firstLoaded) && (
						<div className="flex justify-center">
							<button
								disabled={loading}
								onClick={() => fetchPlaylists(nextOffset)}
								className="px-5 py-2 text-sm rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-blue-950 font-semibold shadow hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all"
							>
								{loading
									? "Loading…"
									: firstLoaded
									? "Load more"
									: "Load playlists"}
							</button>
						</div>
					)}
				</div>
			)}
			{selected && (
				<div className="relative space-y-4 bg-blue-950/40 rounded-xl p-4 ring-1 ring-blue-400/30 backdrop-blur-sm">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-4">
							{selected.images?.[0] && (
								<div className="relative w-20 h-20 rounded-xl overflow-hidden ring-2 ring-green-400/60 shadow-lg">
									<Image
										src={selected.images[0].url}
										alt="cover"
										fill
										sizes="80px"
										className="object-cover scale-105"
									/>
									<div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-green-600/30 mix-blend-overlay" />
								</div>
							)}
							<div className="space-y-1">
								<div className="text-lg font-semibold text-green-50 drop-shadow-sm">
									{selected.name}
								</div>
								<div className="text-xs text-green-100/70 font-medium tracking-wide">
									{tracks.length} / {selected.tracks?.total} tracks loaded
								</div>
							</div>
						</div>
						<button
							onClick={() => {
								setSelected(null)
								setTracks([])
							}}
							className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-green-400 text-blue-950 font-semibold shadow hover:shadow-lg hover:brightness-110 transition-all"
						>
							Back
						</button>
					</div>
					<div className="flex flex-col md:flex-row gap-3 items-stretch">
						<input
							value={importName}
							onChange={(e) => setImportName(e.target.value)}
							placeholder="Setlist name"
							className="flex-1 px-3 py-2 rounded-lg bg-blue-900/40 border border-blue-400/40 focus:border-green-300/70 outline-none text-sm text-green-50 placeholder:text-green-100/40 shadow-inner"
						/>
						<button
							disabled={importing || !tracks.length}
							onClick={handleImport}
							className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-blue-950 font-semibold shadow-lg hover:shadow-emerald-500/30 hover:brightness-110 disabled:opacity-50 disabled:shadow-none text-sm transition-all"
						>
							{importing ? "Importing…" : "Import"}
						</button>
					</div>
					<div className="max-h-80 overflow-y-auto text-sm divide-y divide-blue-400/20 custom-scrollbar pr-1">
						{tracks.map((t) => (
							<div
								key={t.id}
								className="py-1.5 flex items-center justify-between gap-4"
							>
								<div className="truncate">
									<span className="font-medium text-green-50/90">{t.name}</span>{" "}
									<span className="text-green-100/60">
										{t.artists?.map((a) => a.name).join(", ")}
									</span>
								</div>
								<div className="text-green-200/60 text-xs font-mono w-10 text-right">
									{Math.round(t.duration_ms / 1000 / 60)}m
								</div>
							</div>
						))}
						{!tracks.length && (
							<div className="py-8 text-center text-green-100/50 text-sm">
								Loading tracks…
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
