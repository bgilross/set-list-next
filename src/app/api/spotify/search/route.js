import { cookies } from "next/headers"
import { parseSessionCookie, ensureFreshAccess } from "@/lib/spotifyServer"

// Fallback client credentials (server-side only) using env variables (NO secret on client)
const CLIENT_ID =
	process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

let ccCache = { token: null, exp: 0 }
async function getClientCredentialsToken() {
	if (ccCache.token && Date.now() < ccCache.exp) return ccCache.token
	const body = new URLSearchParams({ grant_type: "client_credentials" })
	const res = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization:
				"Basic " +
				Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
		},
		body,
	})
	if (!res.ok) throw new Error("token_fail")
	const json = await res.json()
	ccCache = {
		token: json.access_token,
		exp: Date.now() + (json.expires_in - 60) * 1000,
	}
	return ccCache.token
}

export async function GET(request) {
	const { searchParams } = new URL(request.url)
	const q = searchParams.get("q")
	const type = searchParams.get("type") || "track"
	const limit = searchParams.get("limit") || "6"
	if (!q || q.length < 2) return Response.json({ items: [] })

	const cookieVal = cookies().get("spotify_session")?.value
	let authHeader
	if (cookieVal) {
		try {
			let session = parseSessionCookie(cookieVal)
			session = await ensureFreshAccess(session)
			authHeader = "Bearer " + session.access_token
		} catch {
			// fallback later
		}
	}
	if (!authHeader) {
		if (!CLIENT_ID || !CLIENT_SECRET) {
			return Response.json({ error: "server_not_configured" }, { status: 500 })
		}
		try {
			authHeader = "Bearer " + (await getClientCredentialsToken())
		} catch {
			return Response.json({ error: "token_error" }, { status: 500 })
		}
	}

	const url = `https://api.spotify.com/v1/search?${new URLSearchParams({
		q,
		type,
		limit,
	}).toString()}`
	const res = await fetch(url, { headers: { Authorization: authHeader } })
	if (!res.ok) {
		return Response.json({ error: "search_failed" }, { status: 500 })
	}
	const data = await res.json()
	return Response.json(data)
}
