"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
	Box,
	Button,
	Avatar,
	Typography,
	Paper,
	TextField,
} from "@mui/material"
import Link from "next/link"
import Image from "next/image"
import QRCode from "react-qr-code"
import { useAuth } from "../../lib/AuthContext"
import { useToast } from "@/lib/ToastContext"

export default function ProfilePage() {
	const { user, role, artistId, promoteToArtist, loading } = useAuth()
	const [promoting, setPromoting] = useState(false)
	const [message, setMessage] = useState("")
	const { push } = useToast()

	// Artist profile state
	const [slug, setSlug] = useState("")
	const [publicBlurb, setPublicBlurb] = useState("")
	const [loadingProfile, setLoadingProfile] = useState(false)
	const [savingProfile, setSavingProfile] = useState(false)
	const publicUrl = useMemo(() => {
		// Only expose a public URL when slug looks valid
		const ok = typeof slug === "string" && /^[a-z0-9-]{1,64}$/.test(slug)
		return ok ? `/a/${slug}` : null
	}, [slug])

	// Build an absolute URL for the QR code (client-only)
	const qrTarget = useMemo(() => {
		if (!publicUrl) return null
		try {
			const origin = typeof window !== "undefined" ? window.location.origin : ""
			return `${origin}${publicUrl}`
		} catch {
			return publicUrl
		}
	}, [publicUrl])

	const onPromote = async () => {
		setPromoting(true)
		setMessage("")
		try {
			await promoteToArtist()
			setMessage("Upgraded to artist.")
		} catch (e) {
			setMessage(e.message || "Promotion failed")
		} finally {
			setPromoting(false)
		}
	}

	// Load artist profile (slug, blurb)
	useEffect(() => {
		const load = async () => {
			if (!user) return
			setLoadingProfile(true)
			try {
				const res = await fetch("/api/artist", {
					headers: {
						"x-artist-id": user.uid,
						"x-display-name": user.displayName || "Artist",
					},
					cache: "no-store",
				})
				const json = await res.json()
				if (res.ok && json.success && json.artist) {
					setSlug(json.artist.slug || "")
					setPublicBlurb(json.artist.publicBlurb || "")
				}
			} finally {
				setLoadingProfile(false)
			}
		}
		load()
	}, [user])

	const saveArtist = async () => {
		if (!user) return
		setSavingProfile(true)
		try {
			const res = await fetch("/api/artist", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"x-artist-id": user.uid,
					"x-display-name": user.displayName || "Artist",
				},
				body: JSON.stringify({ slug, publicBlurb }),
			})
			const json = await res.json()
			if (!res.ok || !json.success) throw new Error(json.error || "Save failed")
			push("Artist settings saved", { type: "success" })
		} catch (e) {
			push(e.message || "Failed to save", { type: "error" })
		} finally {
			setSavingProfile(false)
		}
	}

	if (loading) return <div className="p-6">Loading…</div>
	if (!user) return <div className="p-6">Sign in to view your profile.</div>

	return (
		<Box className="p-4 sm:p-6 max-w-2xl mx-auto">
			<Paper className="p-4 sm:p-6">
				<Box className="flex items-center gap-4">
					<Avatar
						src={user.photoURL || undefined}
						alt={user.displayName || "User"}
						sx={{ width: 64, height: 64 }}
					/>
					<Box>
						<Typography variant="h6">{user.displayName || "User"}</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							Role: {role || "AUDIENCE"}
						</Typography>
						{artistId && (
							<Typography
								variant="body2"
								color="text.secondary"
							>
								Artist ID: {artistId}
							</Typography>
						)}
					</Box>
				</Box>
				<Box className="mt-6 flex gap-3">
					{role !== "ARTIST" && (
						<Button
							variant="contained"
							onClick={onPromote}
							disabled={promoting}
						>
							{promoting ? "Promoting…" : "Become an Artist"}
						</Button>
					)}
					<Button
						href="/setlists"
						variant="outlined"
					>
						Go to Dashboard
					</Button>
				</Box>
				{message && (
					<Typography
						variant="body2"
						color="text.secondary"
						className="mt-3"
					>
						{message}
					</Typography>
				)}

				{/* Artist settings */}
				<Box className="mt-8">
					<Typography
						variant="h6"
						className="mb-3"
					>
						Artist Settings
					</Typography>
					<Box className="flex flex-col gap-3">
						<TextField
							label="Public Slug"
							size="small"
							value={slug}
							onChange={(e) => setSlug(e.target.value)}
							helperText="Lowercase letters, numbers, and dashes only"
							disabled={loadingProfile || role !== "ARTIST"}
						/>
						{publicUrl && (
							<div className="text-sm flex flex-col gap-2">
								<div>
									Public link:{" "}
									<Link
										href={publicUrl}
										className="underline text-blue-600"
									>
										{publicUrl}
									</Link>
									<button
										onClick={() => {
											navigator.clipboard?.writeText(
												window.location.origin + publicUrl
											)
											push("Link copied", { type: "success" })
										}}
										className="ml-2 text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
									>
										Copy
									</button>
								</div>
								{/* Local QR render to avoid remote 404s */}
								<div className="flex items-center gap-3 mt-1">
									<div
										className="p-1 bg-white border rounded"
										aria-hidden={!qrTarget}
									>
										{qrTarget ? (
											<QRCode
												value={qrTarget}
												size={120}
												bgColor="#ffffff"
												fgColor="#000000"
											/>
										) : null}
									</div>
									<div className="text-[11px] text-gray-600">
										Scan to open your audience page
									</div>
								</div>
							</div>
						)}
						<TextField
							label="Public Blurb"
							size="small"
							multiline
							minRows={2}
							value={publicBlurb}
							onChange={(e) => setPublicBlurb(e.target.value)}
							disabled={loadingProfile || role !== "ARTIST"}
						/>
						<div>
							<Button
								onClick={saveArtist}
								disabled={savingProfile || role !== "ARTIST"}
								variant="contained"
							>
								{savingProfile ? "Saving…" : "Save"}
							</Button>
						</div>
					</Box>
				</Box>
			</Paper>
		</Box>
	)
}
