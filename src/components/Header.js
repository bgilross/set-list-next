"use client"

import React, { useState } from "react"
import { AppBar, Toolbar } from "@mui/material"
import { Box } from "@mui/system"
import Link from "next/link"

import SpreadWord from "./SpreadWord"
import GoogleLogin from "./GoogleLogin"
import SpotifyLogin from "./SpotifyLogin"
import { useAuth } from "../lib/AuthContext"

const Header = ({ user, onLogin }) => {
	const { role } = useAuth() || {}
	const [spreadWord, setSpreadWord] = useState(false)
	const [mobileOpen, setMobileOpen] = useState(false)
	const toggleMobile = () => setMobileOpen((o) => !o)
	return (
		<AppBar
			position="sticky"
			className="site-gradient backdrop-blur-md shadow-xl glass-edge"
			sx={{
				borderBottomLeftRadius: "1rem",
				borderBottomRightRadius: "1rem",
				zIndex: 10,
			}}
		>
			<Toolbar className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between gap-4">
				{/* Left: Brand */}
				<div className="flex items-center gap-3 select-none">
					<Link
						href="/"
						className="font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight text-white drop-shadow-sm hover:text-green-100 transition"
					>
						Set Lister
					</Link>
				</div>
				{/* Center nav hidden on small screens */}
				<nav className="hidden md:flex flex-1 justify-center">
					<ul className="flex items-center gap-8 text-white/80 text-sm font-semibold">
						<li>
							<Link
								href="/setlists"
								className="px-3 py-1 rounded-full hover:bg-white/10 hover:text-white transition"
							>
								Dashboard
							</Link>
						</li>
						<li>
							<Link
								href="/me"
								className="px-3 py-1 rounded-full hover:bg-white/10 hover:text-white transition"
							>
								Profile
							</Link>
						</li>
						<li>
							<Link
								href="/users"
								className="px-3 py-1 rounded-full hover:bg-white/10 hover:text-white transition"
							>
								Live Artists
							</Link>
						</li>
						{role === "ARTIST" && (
							<li>
								<Link
									href="/requests"
									className="px-3 py-1 rounded-full hover:bg-white/10 hover:text-white transition"
								>
									Requests
								</Link>
							</li>
						)}
					</ul>
				</nav>
				{/* Right: Auth + toggle */}
				<div className="flex items-center gap-2 sm:gap-4">
					<button
						className="md:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
						aria-label="Toggle menu"
						onClick={toggleMobile}
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							{mobileOpen ? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							) : (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							)}
						</svg>
					</button>
					<div className="hidden sm:flex items-center">
						<SpotifyLogin />
					</div>
					<div className="hidden sm:flex items-center">
						<GoogleLogin />
					</div>
				</div>
			</Toolbar>
			{mobileOpen && (
				<div className="md:hidden border-t border-white/10 bg-black/50 backdrop-blur-sm px-4 pb-4 animate-fade-in">
					<ul className="pt-3 flex flex-col gap-2 text-sm text-white/90">
						<li>
							<Link
								href="/setlists"
								className="block w-full px-3 py-2 rounded-lg hover:bg-white/10"
								onClick={() => setMobileOpen(false)}
							>
								Dashboard
							</Link>
						</li>
						<li>
							<Link
								href="/me"
								className="block w-full px-3 py-2 rounded-lg hover:bg-white/10"
								onClick={() => setMobileOpen(false)}
							>
								Profile
							</Link>
						</li>
						<li>
							<Link
								href="/users"
								className="block w-full px-3 py-2 rounded-lg hover:bg-white/10"
								onClick={() => setMobileOpen(false)}
							>
								Live Artists
							</Link>
						</li>
						{role === "ARTIST" && (
							<li>
								<Link
									href="/requests"
									className="block w-full px-3 py-2 rounded-lg hover:bg-white/10"
									onClick={() => setMobileOpen(false)}
								>
									Requests
								</Link>
							</li>
						)}
						<li className="flex flex-col gap-2 pt-3 border-t border-white/10 mt-2">
							<SpotifyLogin />
							<GoogleLogin />
						</li>
					</ul>
				</div>
			)}
		</AppBar>
	)
}

export default Header
