"use client"

import React, { useState } from "react"
import { Box, Button, Avatar, Typography, Paper } from "@mui/material"
import { useAuth } from "../../lib/AuthContext"

export default function ProfilePage() {
	const { user, role, artistId, promoteToArtist, loading } = useAuth()
	const [promoting, setPromoting] = useState(false)
	const [message, setMessage] = useState("")

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
			</Paper>
		</Box>
	)
}
