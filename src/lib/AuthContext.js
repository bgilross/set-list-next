"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { auth, db, googleProvider } from "./firebaseConfig"
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"
import { setDoc, doc, getDoc } from "firebase/firestore"
import { getSetlists, getUserSongs } from "./dbService"
// Lazy dynamic import of Postgres service when flag enabled
const USE_PRISMA_DB = process.env.NEXT_PUBLIC_USE_PRISMA_DB === 'true'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true) // Track loading state
	const [setlists, setSetlists] = useState([])
	const [userSongs, setUserSongs] = useState([])
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
						if (USE_PRISMA_DB) {
							await fetch('/api/setlists', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json', 'x-artist-id': firebaseUser.uid },
								body: JSON.stringify({ name: guestSetlist.name || 'Guest Setlist', songs: guestSetlist.songs })
							})
						} else {
							const { saveSetlist } = await import("./dbService")
							await saveSetlist(
								firebaseUser.uid,
								guestSetlist.songs,
								null,
								guestSetlist.name || "Guest Setlist"
							)
						}
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
				if (USE_PRISMA_DB) {
					const { ensureArtist, listSetlistsPg } = await import('./pgService')
					// Ensure artist row (maps firebase uid)
					await ensureArtist(user.uid, user.displayName || 'Artist')
					const setlistsPg = await listSetlistsPg(user.uid)
					setSetlists(setlistsPg)
					// Songs listing: quick approach fetch all songs for artist
					const { prisma } = await import('./prismaClient')
					const songs = await prisma.song.findMany({ where: { artistId: user.uid }, orderBy: { createdAt: 'desc' } })
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
				} else {
					const tempSetlists = await getSetlists(user.uid)
					setSetlists(tempSetlists.data)
					const tempSongs = await getUserSongs(user.uid)
					setUserSongs(tempSongs.data)
				}
			} catch (e) {
				console.error('Error fetching user data', e)
			}
		}
		if (!loading && user) getData()
	}, [user, loading])

	const signInWithGoogle = async () => {
		try {
			const result = await signInWithPopup(auth, googleProvider)
			setUser(result.user)

			// Check or create user in Firestore
			const userRef = doc(db, "users", result.user.uid)
			const userSnap = await getDoc(userRef)

			if (!userSnap.exists()) {
				const userData = {
					displayName: result.user.displayName,
					email: result.user.email,
					createdAt: new Date().toISOString(),
					userId: result.user.uid,
				}
				await setDoc(userRef, userData)
				console.log("User document created successfully:", result.user.uid)
			} else {
				console.log("User document already exists:", result.user.uid)
			}

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

	return (
		<AuthContext.Provider
			value={{
				user,
				setlists,
				signInWithGoogle,
				logout,
				loading,
				setSetlists,
				userSongs,
				guestSetlist,
				setGuestSetlist,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}
