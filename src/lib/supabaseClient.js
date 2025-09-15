import { createClient } from "@supabase/supabase-js"

// Support multiple env var naming conventions; prefer NEXT_PUBLIC_* for client-side use.
// Some earlier deployments accidentally stored keys as SUPABASE_SUPABASE_ANON_KEY / SERVICE_ROLE_KEY.
const supabaseUrl =
	process.env.NEXT_PUBLIC_SUPABASE_URL ||
	process.env.SUPABASE_URL ||
	process.env.SUPABASE_SUPABASE_URL || // fallback (misnamed)
	""

const supabaseAnonKey =
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	process.env.SUPABASE_ANON_KEY ||
	process.env.SUPABASE_SUPABASE_ANON_KEY || // fallback (misnamed)
	""

function logMissing() {
	const msg =
		"[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in Vercel Project Settings (Environment Variables) and redeploy."
	if (typeof window !== "undefined") {
		console.error(msg)
	} else {
		console.warn(msg)
	}
}

// Build a defensive stub so imports don't crash build when env vars are absent.
let supabase
if (supabaseUrl && supabaseAnonKey) {
	supabase = createClient(supabaseUrl, supabaseAnonKey, {
		realtime: { params: { eventsPerSecond: 25 } },
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
		},
	})
} else {
	logMissing()
	// Proxy that throws a clear error when any property is accessed.
	supabase = new Proxy(
		{},
		{
			get() {
				throw new Error(
					"Supabase client not initialized: define NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY."
				)
			},
		}
	)
}

export { supabase }

export function getSupabaseClient() {
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			"Supabase env vars missing. Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (public) and optionally SUPABASE_SERVICE_ROLE_KEY (server)."
		)
	}
	return supabase
}

// Server-side privileged client (DO NOT import into client components)
export function getServiceClient() {
	const serviceKey =
		process.env.SUPABASE_SERVICE_ROLE_KEY ||
		process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY
	if (!serviceKey)
		throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (server env)")
	return createClient(supabaseUrl, serviceKey, {
		auth: { persistSession: false },
	})
}

export default supabase
