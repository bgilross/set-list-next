import { cookies } from "next/headers"
import { randomUUID } from "crypto"
import {
	generateCodeVerifier,
	generateCodeChallenge,
	buildAuthUrl,
} from "@/lib/spotifyServer"

export const dynamic = "force-dynamic"

export async function GET(request) {
	const { searchParams } = new URL(request.url)
	const debug = searchParams.get("debug") === "1"
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

		if (debug) {
			const redirectParam = new URL(url).searchParams.get("redirect_uri") || ""
			const raw = process.env.SPOTIFY_REDIRECT_URI || ""
			return Response.json({
				debug: true,
				clientId: process.env.SPOTIFY_CLIENT_ID || null,
				redirectEnv: raw,
				redirectEnvLength: raw.length,
				redirectEnvCharCodes: raw.split("").map((c) => c.charCodeAt(0)),
				redirectParam,
				redirectParamLength: redirectParam.length,
				redirectMatches: raw === redirectParam,
				redirectTrimMatches: raw.trim() === redirectParam,
				hasLeadingOrTrailingWhitespace: raw !== raw.trim(),
				constructedAuthUrl: url,
			})
		}

		return Response.redirect(url, 302)
	} catch (e) {
		return new Response("Failed to initiate Spotify auth", { status: 500 })
	}
}
