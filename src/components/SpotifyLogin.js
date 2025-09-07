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
				<span className="text-green-200 text-sm">Spotify Linked</span>
				<button
					onClick={logoutSpotify}
					className="text-red-200 text-xs underline"
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
