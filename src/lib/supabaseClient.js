import { createClient } from "@supabase/supabase-js"

// Support multiple env var naming conventions; prefer NEXT_PUBLIC_* for client-side use
// Vercel / Supabase hosting sometimes uses alternative names (e.g. SUPABASE_NEXT_PUBLIC_SUPABASE_URL)
const supabaseUrl =
	process.env.NEXT_PUBLIC_SUPABASE_URL ||
	process.env.SUPABASE_URL ||
	process.env.SUPABASE_SUPABASE_URL ||
	process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL ||
	process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL ||
	""

const supabaseAnonKey =
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	process.env.SUPABASE_ANON_KEY ||
	process.env.SUPABASE_SUPABASE_ANON_KEY ||
	process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	""

const isConfigured = !!supabaseUrl && !!supabaseAnonKey

function createClientSafe(url, key, opts) {
	if (!url || !key) {
		throw new Error(
			"Supabase environment variables not found. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_* variants) are set."
		)
	}
	return createClient(url, key, opts)
}

// Export a client-like object; delay actual creation to avoid throwing at import time during build
export const supabase = new Proxy(
	{},
	{
		get(_, prop) {
			if (!isConfigured) {
				throw new Error(
					"Supabase client is not configured. Missing URL or ANON key. Check env vars."
				)
			}
			// instantiate real client lazily
			const real = createClientSafe(supabaseUrl, supabaseAnonKey, {
				realtime: { params: { eventsPerSecond: 25 } },
				auth: {
					persistSession: true,
					autoRefreshToken: true,
					detectSessionInUrl: true,
				},
			})
			return real[prop]
		},
	}
)

// Server-side privileged client (DO NOT import into client components)
export function getServiceClient() {
	const serviceKey =
		process.env.SUPABASE_SERVICE_ROLE_KEY ||
		process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY
	if (!serviceKey)
		throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (server env)")
	if (!supabaseUrl)
		throw new Error(
			"Missing SUPABASE_URL (server env) or NEXT_PUBLIC_SUPABASE_URL"
		)
	return createClientSafe(supabaseUrl, serviceKey, {
		auth: { persistSession: false },
	})
}

export default supabase
