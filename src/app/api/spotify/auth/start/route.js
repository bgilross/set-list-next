import { cookies } from "next/headers"
import { randomUUID } from "crypto"
import {
	generateCodeVerifier,
	generateCodeChallenge,
	buildAuthUrl,
} from "@/lib/spotifyServer"

export async function GET() {
	try {
		const verifier = generateCodeVerifier()
		const challenge = await generateCodeChallenge(verifier)
		const state = randomUUID()
		const scopes = [
			"playlist-read-private",
			"playlist-read-collaborative",
			"user-read-email",
			"user-read-private",
		]
		const c = cookies()
		c.set("spotify_pkce_verifier", verifier, {
			httpOnly: true,
			path: "/",
			maxAge: 600,
			sameSite: "lax",
		})
		c.set("spotify_oauth_state", state, {
			httpOnly: true,
			path: "/",
			maxAge: 600,
			sameSite: "lax",
		})
		const url = buildAuthUrl({ state, codeChallenge: challenge, scopes })
		return Response.redirect(url, 302)
	} catch (e) {
		return new Response("Failed to initiate Spotify auth", { status: 500 })
	}
}
