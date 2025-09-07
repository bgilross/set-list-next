import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
	exchangeCodeForToken,
	fetchProfile,
	buildSessionCookie,
	parseSessionCookie,
} from "@/lib/spotifyServer"

export async function GET(request) {
	const { searchParams } = new URL(request.url)
	const code = searchParams.get("code")
	const state = searchParams.get("state")
	const error = searchParams.get("error")

	const c = cookies()
	const savedState = c.get("spotify_oauth_state")?.value
	const verifier = c.get("spotify_pkce_verifier")?.value

	const redirect = (path) => NextResponse.redirect(new URL(path, request.url))

	if (error) return redirect(`/?spotifyError=${encodeURIComponent(error)}`)
	if (!code || !state || state !== savedState || !verifier) {
		return redirect(`/?spotifyError=invalid_state`)
	}

	try {
		const tokenData = await exchangeCodeForToken({
			code,
			codeVerifier: verifier,
		})
		const profile = await fetchProfile(tokenData.access_token)
		const { value } = buildSessionCookie({ ...tokenData, profile })

		c.set("spotify_session", value, {
			httpOnly: true,
			path: "/",
			maxAge: 60 * 60 * 24 * 30,
			sameSite: "lax",
		})
		// Clean temp cookies
		c.delete("spotify_pkce_verifier")
		c.delete("spotify_oauth_state")
		return redirect(`/`)
	} catch (e) {
		console.error("Spotify auth callback failure:", e)
		return redirect(`/?spotifyError=auth_failed`)
	}
}
