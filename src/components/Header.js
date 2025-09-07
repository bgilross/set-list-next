"use client"

import React from "react"
import { AppBar, Toolbar } from "@mui/material"
import { Box } from "@mui/system"
import Link from "next/link"

import SpreadWord from "./SpreadWord"
import { useState } from "react"
import GoogleLogin from "./GoogleLogin"
import SpotifyLogin from "./SpotifyLogin"

const Header = ({ user, onLogin }) => {
	const [spreadWord, setSpreadWord] = useState(false)
	return (
		<AppBar
			position="sticky"
			className="bg-blue-600/95 backdrop-blur shadow-lg"
			sx={{
				borderBottomLeftRadius: "1rem",
				borderBottomRightRadius: "1rem",
				zIndex: 10,
			}}
		>
			<Toolbar className="h-20 px-8 flex items-center justify-between gap-6">
				{/* Left: Brand */}
				<div className="flex items-center gap-3">
					<Link
						href="/"
						className="text-green-200 font-extrabold text-3xl tracking-tight hover:text-green-50 transition"
					>
						Set Lister
					</Link>
				</div>
				{/* Center: Navigation */}
				<nav className="flex-1 flex justify-center">
					<ul className="flex items-center gap-8 text-green-100 text-sm font-semibold">
						<li>
							<Link
								href="/setlists"
								className="px-3 py-1 rounded-full hover:bg-green-300/20 transition"
							>
								Dashboard
							</Link>
						</li>
					</ul>
				</nav>
				{/* Right: Auth + Spotify */}
				<div className="flex items-center gap-5">
					<div className="flex items-center">
						<SpotifyLogin />
					</div>
					<div className="flex items-center">
						<GoogleLogin />
					</div>
				</div>
			</Toolbar>
		</AppBar>
	)
}

export default Header
