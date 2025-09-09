import { createClient } from "@supabase/supabase-js"

// Expect env vars:
// Reads ONLY from environment variables. Do *not* hardcode keys here.
// Required (public): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
// Optional (server): SUPABASE_SERVICE_ROLE_KEY (never expose client-side)

// Support multiple possible naming conventions so you don't have to rename what the Vercel integration created.
// Priority order: explicit NEXT_PUBLIC_* (standard) -> plain SUPABASE_* -> odd prefixed variants.
const supabaseUrl =
	process.env.NEXT_PUBLIC_SUPABASE_URL ||
	process.env.SUPABASE_URL ||
	process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL ||
	""

const supabaseAnonKey =
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	process.env.SUPABASE_ANON_KEY ||
	process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	""

if (!supabaseUrl || !supabaseAnonKey) {
	if (typeof window !== "undefined") {
		// Surface clearer error in browser console
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
