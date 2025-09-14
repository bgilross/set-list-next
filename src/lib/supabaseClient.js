import { createClient } from "@supabase/supabase-js"

// Support multiple env var naming conventions; prefer NEXT_PUBLIC_* for client-side use
const supabaseUrl =
	process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""

const supabaseAnonKey =
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	process.env.SUPABASE_ANON_KEY ||
	""

if (!supabaseUrl || !supabaseAnonKey) {
	if (typeof window !== "undefined") {
		console.error(
			"[Supabase] Missing env vars NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
		)
	} else {
		console.warn(
			"[Supabase] Environment variables not set; client will be unusable."
		)
	}
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	realtime: { params: { eventsPerSecond: 25 } },
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
	},
})

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
