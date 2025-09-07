// Server-side Spotify auth utilities (PKCE)
import crypto from "crypto"

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
const SPOTIFY_ME_URL = "https://api.spotify.com/v1/me"

export function requiredEnv(name) {
	const v = process.env[name]
	if (!v) throw new Error(`Missing required env var ${name}`)
	return v
}

export function generateCodeVerifier() {
	return crypto.randomBytes(32).toString("base64url")
}

export async function generateCodeChallenge(verifier) {
	return crypto
		.createHash("sha256")
		.update(verifier)
		.digest("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "")
}

export function buildAuthUrl({ state, codeChallenge, scopes }) {
	const params = new URLSearchParams({
		client_id: requiredEnv("SPOTIFY_CLIENT_ID"),
		response_type: "code",
		redirect_uri: requiredEnv("SPOTIFY_REDIRECT_URI"),
		code_challenge_method: "S256",
		code_challenge: codeChallenge,
		scope: scopes.join(" "),
		state,
		show_dialog: "true",
	})
	return `${SPOTIFY_AUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForToken({ code, codeVerifier }) {
	const body = new URLSearchParams({
		client_id: requiredEnv("SPOTIFY_CLIENT_ID"),
		grant_type: "authorization_code",
		code,
		redirect_uri: requiredEnv("SPOTIFY_REDIRECT_URI"),
		code_verifier: codeVerifier,
		client_secret: requiredEnv("SPOTIFY_CLIENT_SECRET"),
	})
	const res = await fetch(SPOTIFY_TOKEN_URL, { method: "POST", body })
	if (!res.ok) throw new Error("Spotify token exchange failed")
	return await res.json()
}

export async function refreshToken({ refreshToken }) {
	const body = new URLSearchParams({
		client_id: requiredEnv("SPOTIFY_CLIENT_ID"),
		grant_type: "refresh_token",
		refresh_token: refreshToken,
		client_secret: requiredEnv("SPOTIFY_CLIENT_SECRET"),
	})
	const res = await fetch(SPOTIFY_TOKEN_URL, { method: "POST", body })
	if (!res.ok) throw new Error("Spotify refresh failed")
	return await res.json()
}

export async function fetchProfile(accessToken) {
	const res = await fetch(SPOTIFY_ME_URL, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})
	if (!res.ok) throw new Error("Failed fetching Spotify profile")
	return await res.json()
}

export function buildSessionCookie({
	access_token,
	refresh_token,
	expires_in,
	profile,
}) {
	const expiresAt = Date.now() + (expires_in - 60) * 1000 // subtract 60s buffer
	const payload = { access_token, refresh_token, expiresAt, profile }
	return {
		value: Buffer.from(JSON.stringify(payload)).toString("base64url"),
		expiresAt,
	}
}

export function parseSessionCookie(raw) {
	try {
		if (!raw) return null
		const json = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"))
		return json
	} catch {
		return null
	}
}

export async function ensureFreshAccess(session) {
	if (!session) return null
	if (Date.now() < session.expiresAt) return session
	const refreshed = await refreshToken({ refreshToken: session.refresh_token })
	const merged = {
		...session,
		access_token: refreshed.access_token,
		expiresAt: Date.now() + (refreshed.expires_in - 60) * 1000,
	}
	return merged
}
