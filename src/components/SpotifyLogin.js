"use client"
import { useEffect, useState } from "react"

const SpotifyLogin = ({ onLinked }) => {
	const [loading, setLoading] = useState(true)
	const [session, setSession] = useState(null)
	const [error, setError] = useState(null)

	async function loadSession() {
		setLoading(true)
		try {
			const res = await fetch("/api/spotify/session")
			const json = await res.json()
			if (json.authenticated) setSession(json)
			else setSession(null)
		} catch (e) {
			setError("Failed loading Spotify session")
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadSession()
	}, [])

	const startAuth = () => {
		window.location.href = "/api/spotify/auth/start"
	}

	const logoutSpotify = async () => {
		await fetch("/api/spotify/logout", { method: "POST" })
		await loadSession()
	}

	useEffect(() => {
		if (session && onLinked) onLinked(session)
	}, [session, onLinked])

	if (loading)
		return (
			<button
				disabled
				className="px-3 py-2 text-xs rounded bg-gray-300"
			>
				Spotify…
			</button>
		)
	if (session) {
		return (
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-1 pl-2 pr-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-green-600/40 via-teal-600/40 to-blue-600/40 border border-white/15 text-green-50 text-[10px] sm:text-[11px] font-semibold shadow-inner">
					<span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse" />
					Linked
				</div>
				<button
					onClick={logoutSpotify}
					className="text-[9px] sm:text-[10px] text-red-200/80 hover:text-red-100 underline"
				>
					Unlink
				</button>
			</div>
		)
	}
	return (
		<button
			onClick={startAuth}
			className="relative px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
		>
			{error ? "Retry Spotify" : "Spotify Login"}
		</button>
	)
}
export default SpotifyLogin
