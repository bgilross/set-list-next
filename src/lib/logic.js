//Spotify API Logic

// Refactored: all sensitive Spotify calls should go through server routes.
// Client now only calls our Next.js API endpoints.

export async function searchSpotifySongs(query) {
	if (!query) return []
	let res
	try {
		res = await fetch(
			`/api/spotify/search?` +
				new URLSearchParams({ q: query, type: "track", limit: "6" })
		)
	} catch (e) {
		console.warn("spotify search network error", e)
		return []
	}
	let data
	try {
		data = await res.json()
	} catch (e) {
		console.warn("spotify search bad json", e)
		return []
	}
	if (!res.ok || data?.error) {
		console.warn("spotify search api error", data)
		return []
	}
	return data?.tracks?.items || []
}

// TEMP: still uses public API via server search route enhancement in future
export async function getSongsByIds(idsCsv) {
	if (!idsCsv) return []
	const res = await fetch(
		`/api/spotify/tracks?ids=${encodeURIComponent(idsCsv)}`
	)
	if (!res.ok) return []
	const data = await res.json()
	return data.tracks || []
}
