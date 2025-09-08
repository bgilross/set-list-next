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
export async function getSongsByIds(ids) {
	if (!ids || (Array.isArray(ids) && ids.length === 0)) return []
	const rawArray = Array.isArray(ids) ? ids : String(ids).split(",")
	// Filter out blanks / undefined / obviously invalid IDs
	const spotifyIdRegex = /^[A-Za-z0-9]{22}$/
	const idArray = rawArray.filter(
		(id) => typeof id === "string" && spotifyIdRegex.test(id.trim())
	)
	if (!idArray.length) {
		console.warn("getSongsByIds: no valid IDs after filtering", ids)
		return []
	}
	const chunks = []
	for (let i = 0; i < idArray.length; i += 50) {
		chunks.push(idArray.slice(i, i + 50))
	}
	const results = []
	for (const chunk of chunks) {
		const res = await fetch(`/api/spotify/tracks?ids=${chunk.join(",")}`)
		if (!res.ok) {
			console.warn("spotify tracks batch failed", chunk)
			continue
		}
		try {
			const data = await res.json()
			for (const t of data.tracks || []) {
				// Normalize artist fallback for legacy consumers
				if (!t.artist && t.artists?.length) {
					Object.defineProperty(t, "artist", {
						value: t.artists[0].name,
						enumerable: true,
						configurable: true,
					})
				}
				results.push(t)
			}
		} catch (e) {
			console.warn("parse tracks batch error", e)
		}
	}
	return results
}
