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
				<div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-600/30 border border-green-400/40 text-green-200 text-xs font-medium">
					<span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse" />
					Linked
				</div>
				<button
					onClick={logoutSpotify}
					className="text-[10px] text-red-200/80 hover:text-red-100 underline"
				>
					Unlink
				</button>
			</div>
		)
	}
	return (
		<button
			onClick={startAuth}
			className="px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold shadow"
		>
			{error ? "Retry Spotify" : "Login with Spotify"}
		</button>
	)
}
export default SpotifyLogin
