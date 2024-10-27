"use client"

import React from "react"
import { AppBar, Toolbar, Typography } from "@mui/material"
import { Box } from "@mui/system"

const Footer = () => {
	return (
		<AppBar
			position="static"
			className="bg-blue-600 shadow-2xl shadow-blue-900"
			sx={{
				borderTopLeftRadius: "1rem",
				borderTopRightRadius: "1rem",
				zIndex: 10,
			}}
		>
			<Toolbar className="flex justify-between px-6 py-4">
				{/* Left: Logo or Text */}
				<Box className="w-1/3">
					<Typography
						variant="h6"
						className="text-green-200"
					></Typography>
				</Box>

				{/* Right: Additional Links or Icons */}
				<Box className="w-1/3">
					<Typography
						variant="body2"
						className="text-green-200"
					>
						{/* You can add more links here */}
						<a
							href="#"
							className="hover:text-white transition duration-200"
						>
							Privacy Policy
						</a>
						{" | "}
						<a
							href="#"
							className="hover:text-white transition duration-200"
						>
							Terms of Service
						</a>
					</Typography>
				</Box>

				<Box>
					<Typography
						variant="h6"
						className="text-green-200"
					>
						Set Lister © {new Date().getFullYear()}
					</Typography>
				</Box>
			</Toolbar>
		</AppBar>
	)
}

export default Footer
