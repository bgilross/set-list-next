"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"
import { auth, googleProvider } from "./firebaseConfig"
// Lazy dynamic import of Postgres service when flag enabled
const USE_PRISMA_DB = process.env.NEXT_PUBLIC_USE_PRISMA_DB === "true"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true) // Track loading state
	const [setlists, setSetlists] = useState([])
	const [userSongs, setUserSongs] = useState([])
	const [role, setRole] = useState(null)
	const [artistId, setArtistId] = useState(null)
	const [guestSetlist, setGuestSetlist] = useState(() => {
		if (typeof window === "undefined") return null
		try {
			const raw = localStorage.getItem("guest_setlist")
			return raw ? JSON.parse(raw) : null
		} catch {
			return null
		}
	})

	// Persist guest setlist
	useEffect(() => {
		if (typeof window === "undefined") return
		if (guestSetlist)
			localStorage.setItem("guest_setlist", JSON.stringify(guestSetlist))
		else localStorage.removeItem("guest_setlist")
	}, [guestSetlist])

	// Listen to Auth state changes and set the user; migrate guest setlist if exists
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				setUser(firebaseUser)
				setLoading(false)
				// Migrate guest setlist after login (fire and forget)
				try {
					if (guestSetlist?.songs?.length) {
						await fetch("/api/setlists", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"x-artist-id": firebaseUser.uid,
							},
							body: JSON.stringify({
								name: guestSetlist.name || "Guest Setlist",
								songs: guestSetlist.songs,
							}),
						})
						setGuestSetlist(null)
					}
				} catch (e) {
					console.warn("guest migration failed", e)
				}
			} else {
				// Try Spotify session as fallback
				try {
					const res = await fetch("/api/spotify/session")
					const json = await res.json()
					if (json.authenticated) {
						const spotifyUser = {
							uid: "spotify_" + json.profile.id,
							displayName: json.profile.display_name || json.profile.id,
							photoURL: json.profile.images?.[0]?.url,
							provider: "spotify",
							spotifyProfile: json.profile,
						}
						setUser(spotifyUser)
					} else {
						setUser(null)
					}
				} catch {
					setUser(null)
				} finally {
					setLoading(false)
				}
			}
		})
		return () => unsubscribe()
		// guestSetlist included for migration correctness; only triggers when auth state flips or guest changes while logging in
	}, [guestSetlist])

	// Fetch setlists / songs when user state changes (Firestore or Prisma)
	useEffect(() => {
		const getData = async () => {
			if (!user) return
			try {
				// Fetch role and artist mapping
				try {
					const me = await fetch("/api/me", {
						headers: { "x-artist-id": user.uid },
					})
					const meJson = await me.json()
					if (meJson?.user) {
						setRole(meJson.user.role)
						setArtistId(meJson.artistId)
					}
				} catch {}
				const { ensureArtist, listSetlistsPg } = await import("./pgService")
				// Ensure artist row (maps firebase uid)
				await ensureArtist(user.uid, user.displayName || "Artist")
				const setlistsPg = await listSetlistsPg(user.uid)
				setSetlists(setlistsPg)
				// Fetch songs via API or Prisma directly; keep simple here
				const { prisma } = await import("./prismaClient")
				const songs = await prisma.song.findMany({
					where: { artistId: user.uid },
					orderBy: { createdAt: "desc" },
				})
				setUserSongs(
					songs.map((s) => ({
						id: s.id,
						name: s.name,
						artist: s.artistName,
						spotifyId: s.spotifyId,
						userTags: s.userTags,
						notes: s.notes,
					}))
				)
			} catch (e) {
				console.error("Error fetching user data", e)
			}
		}
		if (!loading && user) getData()
	}, [user, loading])

	const signInWithGoogle = async () => {
		try {
			const result = await signInWithPopup(auth, googleProvider)
			setUser(result.user)
			return result.user
		} catch (error) {
			throw new Error(error.message)
		}
	}

	const logout = async () => {
		try {
			if (user?.provider === "spotify" && !auth.currentUser) {
				await fetch("/api/spotify/logout", { method: "POST" })
				setUser(null)
				return
			}
			await signOut(auth)
			await fetch("/api/spotify/logout", { method: "POST" }) // also clear spotify if linked only
			setUser(null)
		} catch (error) {
			throw new Error(error.message)
		}
	}

	const promoteToArtist = async () => {
		if (!user) throw new Error("Not authenticated")
		const res = await fetch("/api/artist/promote", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-artist-id": user.uid,
				"x-display-name": user.displayName || "Artist",
			},
			body: JSON.stringify({}),
		})
		if (!res.ok) throw new Error("Promotion failed")
		// Refresh role via /api/me
		try {
			const me = await fetch("/api/me", {
				headers: { "x-artist-id": user.uid },
			})
			const meJson = await me.json()
			if (meJson?.user) {
				setRole(meJson.user.role)
				setArtistId(meJson.artistId)
			}
		} catch {}
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				setlists,
				signInWithGoogle,
				logout,
				promoteToArtist,
				loading,
				setSetlists,
				userSongs,
				role,
				artistId,
				guestSetlist,
				setGuestSetlist,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}
