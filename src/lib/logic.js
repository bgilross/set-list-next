//Spotify API Logic

import axios from "axios"

// TODO: Move these to server-side env vars (e.g. .env.local) and proxy through a Next.js Route Handler.
// Never ship secrets to the browser in production.
const client_id =
	process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ||
	"4a25bc2ba5d942ceac4b96d09a9145a5"
const client_secret =
	process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET ||
	"7cf97751b14e454cac92248db99b2f2b"

function encodeBasic(id, secret) {
	if (!id || !secret) throw new Error("Missing Spotify credentials")
	// Use Buffer on server / supported environments, fallback to btoa in browser
	if (typeof Buffer !== "undefined" && Buffer.from) {
		return Buffer.from(`${id}:${secret}`).toString("base64")
	}
	if (typeof window !== "undefined" && typeof btoa === "function") {
		return btoa(`${id}:${secret}`)
	}
	throw new Error("No method to base64 encode credentials")
}

let tokenCache = {
	access_token: null,
	expires_at: null, // Store expiration time
}

export async function getToken() {
	console.log("Fetching token...")

	// If cached token is still valid, return it
	if (tokenCache.access_token && Date.now() < tokenCache.expires_at) {
		console.log("Using cached token...")
		return tokenCache.access_token
	}

	try {
		console.log("No Cache. Fetching new token...")
		const response = await axios.post(
			"https://accounts.spotify.com/api/token",
			"grant_type=client_credentials",
			{
				headers: {
					Authorization: "Basic " + encodeBasic(client_id, client_secret),
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		)
		console.log("POST finished. Response:", response)

		const { access_token, expires_in } = response.data
		// Store token and expiration time
		tokenCache.access_token = access_token
		tokenCache.expires_at = Date.now() + expires_in * 2500

		return access_token
	} catch (error) {
		console.error("Error fetching Spotify token:", error)
		throw new Error("Unable to retrieve Spotify access token")
	}
}

// Function to search songs using the Spotify API
export async function searchSpotifySongs(query) {
	const token = await getToken() // Retrieve a valid token
	console.log("Token: ", token)

	try {
		const result = await axios.get(
			`https://api.spotify.com/v1/search?q=${query}&type=track&limit=6`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)

		return result.data.tracks.items // Return search results
	} catch (error) {
		console.error("Error searching Spotify songs:", error)
		throw new Error("Unable to search Spotify songs")
	}
}

export async function getSongsByIds(songIds) {
	const token = await getToken() // Retrieve a valid token

	try {
		const result = await axios.get(
			`https://api.spotify.com/v1/tracks?ids=${songIds}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		return result.data.tracks
	} catch (error) {
		console.error("Error searching Spotify songs:", error)
		throw new Error("Unable to search Spotify songs")
	}
}
