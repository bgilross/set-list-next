import { cookies } from "next/headers"

export async function POST() {
	const c = cookies()
	c.delete("spotify_session")
	return new Response(null, { status: 204 })
}
