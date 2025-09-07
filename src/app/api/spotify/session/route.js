import { cookies } from "next/headers"
import { parseSessionCookie, ensureFreshAccess } from "@/lib/spotifyServer"

export async function GET() {
	const raw = cookies().get("spotify_session")?.value
	if (!raw) return Response.json({ authenticated: false })
	let session = parseSessionCookie(raw)
	if (!session) return Response.json({ authenticated: false })
	try {
		session = await ensureFreshAccess(session)
	} catch {}
	return Response.json({
		authenticated: true,
		profile: session.profile,
		expiresAt: session.expiresAt,
		provider: "spotify",
	})
}
