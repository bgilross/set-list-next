import { cookies } from "next/headers"
import { parseSessionCookie, ensureFreshAccess } from "@/lib/spotifyServer"

export async function GET(request, { params }) {
	const raw = cookies().get("spotify_session")?.value
	if (!raw) return new Response("Unauthorized", { status: 401 })
	let session = parseSessionCookie(raw)
	if (!session) return new Response("Unauthorized", { status: 401 })
	session = await ensureFreshAccess(session)
	const { searchParams } = new URL(request.url)
	const limit = searchParams.get("limit") || "100"
	const offset = searchParams.get("offset") || "0"
	const id = params.id
	const url = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=${limit}&offset=${offset}`
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${session.access_token}` },
	})
	if (!res.ok) return new Response("Failed", { status: 500 })
	const data = await res.json()
	return Response.json(data)
}
