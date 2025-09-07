import { cookies } from "next/headers"
import { parseSessionCookie, ensureFreshAccess } from "@/lib/spotifyServer"

// Fallback client credentials (server-side only) using env variables (NO secret on client)
const CLIENT_ID =
	process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

const IS_PROD = process.env.NODE_ENV === 'production'

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
	const body = new URLSearchParams({ grant_type: 'client_credentials' })
	let res
	try {
		res = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization:
					'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
			},
			body,
		})
	} catch (e) {
		if (!IS_PROD) console.error('[spotify][token] network error', e)
		throw new Error('token_network')
	}
	if (!res.ok) {
		if (!IS_PROD) {
			const text = await res.text().catch(() => '')
			console.error('[spotify][token] non-ok', res.status, text)
		}
		throw new Error('token_fail')
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
	const q = searchParams.get('q')
	const type = searchParams.get('type') || 'track'
	const limit = searchParams.get('limit') || '6'
	if (!q || q.length < 2) {
		return Response.json({ items: [], debug: debugPayload({ reason: 'short_query' }) })
	}

	const cookieVal = cookies().get('spotify_session')?.value
	let authHeader
	if (cookieVal) {
		try {
			let session = parseSessionCookie(cookieVal)
			session = await ensureFreshAccess(session)
			authHeader = 'Bearer ' + session.access_token
		} catch (e) {
			if (!IS_PROD) console.warn('[spotify][search] session fallback', e?.message)
		}
	}
	if (!authHeader) {
		if (!CLIENT_ID || !CLIENT_SECRET) {
			if (!IS_PROD) console.error('[spotify][search] missing env vars')
			return Response.json(
				{ error: 'server_not_configured', debug: debugPayload({ reason: 'missing_env' }) },
				{ status: 500 }
			)
		}
		try {
			authHeader = 'Bearer ' + (await getClientCredentialsToken())
		} catch (e) {
			return Response.json(
				{ error: 'token_error', debug: debugPayload({ reason: e.message }) },
				{ status: 500 }
			)
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
		if (!IS_PROD) console.error('[spotify][search] network error', e)
		return Response.json(
			{ error: 'network_error', debug: debugPayload({ reason: 'network', detail: e.message }) },
			{ status: 500 }
		)
	}
	if (!res.ok) {
		const text = !IS_PROD ? await res.text().catch(() => '') : undefined
		if (!IS_PROD) console.error('[spotify][search] non-ok', res.status, text)
		return Response.json(
			{
				error: 'search_failed',
				debug: debugPayload({ status: res.status, body: text?.slice(0, 400) }),
			},
			{ status: 500 }
		)
	}
	let data
	try {
		data = await res.json()
	} catch (e) {
		return Response.json(
			{ error: 'bad_json', debug: debugPayload({ reason: e.message }) },
			{ status: 500 }
		)
	}
	if (!IS_PROD) data.debug = debugPayload({ reason: 'ok' })
	return Response.json(data)
}
