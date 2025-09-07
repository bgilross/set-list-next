import { cookies } from "next/headers"
import { parseSessionCookie, ensureFreshAccess } from "@/lib/spotifyServer"

// Fallback client credentials (server-side only) using env variables (NO secret on client)
const CLIENT_ID =
	process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

const IS_PROD = process.env.NODE_ENV === "production"

// Ensure this route isn't statically optimized so env updates + auth cookie are always fresh
export const dynamic = "force-dynamic"

function debugPayload(extra) {
	if (IS_PROD) return undefined
	return {
		...extra,
		hasClientId: Boolean(CLIENT_ID),
		hasClientSecret: Boolean(CLIENT_SECRET),
		ts: Date.now(),
	}
}

let ccCache = { token: null, exp: 0 }
async function getClientCredentialsToken() {
	if (ccCache.token && Date.now() < ccCache.exp) return ccCache.token
	const body = new URLSearchParams({ grant_type: "client_credentials" })
	let res
	try {
		res = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization:
					"Basic " +
					Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
			},
			body,
		})
	} catch (e) {
		if (!IS_PROD) console.error("[spotify][token] network error", e)
		throw new Error("token_network")
	}
	if (!res.ok) {
		if (!IS_PROD) {
			const text = await res.text().catch(() => "")
			console.error("[spotify][token] non-ok", res.status, text)
		}
		throw new Error("token_fail")
	}
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

	const errorResponse = (code, payload = {}) =>
		Response.json(
			{
				error: code,
				...(!IS_PROD
					? { debug: debugPayload({ reason: code, ...payload }) }
					: {}),
			},
			{ status: 500, headers: { "X-Spotify-Error-Code": code } }
		)

	if (!q || q.length < 2) {
		return Response.json(
			{ items: [], debug: debugPayload({ reason: "short_query" }) },
			{ headers: { "X-Spotify-Status": "short_query" } }
		)
	}

	const cookieVal = cookies().get("spotify_session")?.value
	let authHeader
	if (cookieVal) {
		try {
			let session = parseSessionCookie(cookieVal)
			session = await ensureFreshAccess(session)
			authHeader = "Bearer " + session.access_token
		} catch (e) {
			if (!IS_PROD)
				console.warn("[spotify][search] session fallback", e?.message)
		}
	}
	if (!authHeader) {
		if (!CLIENT_ID || !CLIENT_SECRET) {
			if (!IS_PROD) console.error("[spotify][search] missing env vars")
			return errorResponse("server_not_configured", { reason: "missing_env" })
		}
		try {
			authHeader = "Bearer " + (await getClientCredentialsToken())
		} catch (e) {
			return errorResponse("token_error", { reason: e.message })
		}
	}

	const url = `https://api.spotify.com/v1/search?${new URLSearchParams({
		q,
		type,
		limit,
	}).toString()}`
	let res
	try {
		res = await fetch(url, { headers: { Authorization: authHeader } })
	} catch (e) {
		if (!IS_PROD) console.error("[spotify][search] network error", e)
		return errorResponse("network_error", { detail: e.message })
	}
	if (!res.ok) {
		const text = !IS_PROD ? await res.text().catch(() => "") : undefined
		if (!IS_PROD) console.error("[spotify][search] non-ok", res.status, text)
		return errorResponse("search_failed", {
			status: res.status,
			body: text?.slice(0, 400),
		})
	}
	let data
	try {
		data = await res.json()
	} catch (e) {
		return errorResponse("bad_json", { reason: e.message })
	}
	if (!IS_PROD) data.debug = debugPayload({ reason: "ok" })
	return Response.json(data)
}
