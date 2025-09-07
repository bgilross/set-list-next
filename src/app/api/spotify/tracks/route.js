import { cookies } from "next/headers"
import { parseSessionCookie, ensureFreshAccess } from "@/lib/spotifyServer"
import { NextResponse } from "next/server"

const CLIENT_ID =
	process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
let ccCache = { token: null, exp: 0 }
async function ccToken() {
	if (ccCache.token && Date.now() < ccCache.exp) return ccCache.token
	if (!CLIENT_ID || !CLIENT_SECRET) throw new Error("no_creds")
	const body = new URLSearchParams({ grant_type: "client_credentials" })
	const r = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization:
				"Basic " +
				Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
		},
		body,
	})
	if (!r.ok) throw new Error("fail_token")
	const j = await r.json()
	ccCache = {
		token: j.access_token,
		exp: Date.now() + (j.expires_in - 60) * 1000,
	}
	return ccCache.token
}

export async function GET(request) {
	const { searchParams } = new URL(request.url)
	const ids = searchParams.get("ids")
	if (!ids) return NextResponse.json({ tracks: [] })
	let auth
	const raw = cookies().get("spotify_session")?.value
	if (raw) {
		try {
			let s = parseSessionCookie(raw)
			s = await ensureFreshAccess(s)
			auth = "Bearer " + s.access_token
		} catch {}
	}
	if (!auth) {
		try {
			auth = "Bearer " + (await ccToken())
		} catch {
			return NextResponse.json({ error: "no_auth" }, { status: 500 })
		}
	}
	const url = "https://api.spotify.com/v1/tracks?ids=" + encodeURIComponent(ids)
	const res = await fetch(url, { headers: { Authorization: auth } })
	if (!res.ok)
		return NextResponse.json({ error: "tracks_failed" }, { status: 500 })
	const data = await res.json()
	return NextResponse.json(data)
}
