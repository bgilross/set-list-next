"use client"

import React from "react"
import { AppBar, Toolbar, Typography } from "@mui/material"
import { Box } from "@mui/system"

const Footer = () => {
	return (
		<AppBar
			position="static"
			className="site-gradient backdrop-blur-md shadow-inner"
			sx={{
				borderTopLeftRadius: "1rem",
				borderTopRightRadius: "1rem",
				zIndex: 10,
			}}
		>
			<Toolbar className="flex justify-between px-4 sm:px-6 py-3 sm:py-4 gap-4">
				{/* Left: Logo or Text */}
				<Box className="w-1/2 sm:w-1/3">
					<Typography
						variant="h6"
						className="font-bold text-white drop-shadow-sm"
					>
						Set Lister
					</Typography>
				</Box>

				{/* Right: Additional Links or Icons */}
				<Box className="hidden sm:flex w-1/3 items-center justify-center">
					<Typography
						variant="body2"
						className="text-white/80 text-center space-x-2"
					>
						<a
							href="#"
							className="hover:text-white transition"
						>
							Privacy
						</a>
						<span className="text-white/40">•</span>
						<a
							href="#"
							className="hover:text-white transition"
						>
							Terms
						</a>
					</Typography>
				</Box>

				<Box className="w-1/2 sm:w-1/3 flex justify-end">
					<Typography
						variant="body2"
						className="text-white/70"
					>
						© {new Date().getFullYear()}
					</Typography>
				</Box>
			</Toolbar>
		</AppBar>
	)
}

export default Footer
