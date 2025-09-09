"use client"

import {
	Box,
	Button,
	Avatar,
	Typography,
	Menu,
	MenuItem,
	IconButton,
	Slide,
	Paper,
} from "@mui/material"
import { useState, useRef, useEffect, forwardRef } from "react"
// Removed direct firebase imports; use AuthContext only
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { useAuth } from "../lib/AuthContext"

const Transition = forwardRef(function Transition(props, ref) {
	return (
		<Slide
			direction="down"
			ref={ref}
			{...props}
		/>
	)
})

const GoogleLogin = ({ hover }) => {
	const { user, signInWithGoogle, logout } = useAuth()
	const [anchorEl, setAnchorEl] = useState(null) // Menu anchor
	const [menuOpen, setMenuOpen] = useState(false) // Menu open
	const [signingIn, setSigningIn] = useState(false) // Loading state for login button
	const menuRef = useRef(null)
	const buttonRef = useRef(null)

	// Close on outside click / escape
	useEffect(() => {
		if (!menuOpen) return
		function handleClick(e) {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target) &&
				buttonRef.current &&
				!buttonRef.current.contains(e.target)
			) {
				setMenuOpen(false)
			}
		}
		function handleKey(e) {
			if (e.key === "Escape") setMenuOpen(false)
		}
		document.addEventListener("mousedown", handleClick)
		document.addEventListener("keydown", handleKey)
		return () => {
			document.removeEventListener("mousedown", handleClick)
			document.removeEventListener("keydown", handleKey)
		}
	}, [menuOpen])

	const handleGoogleSignIn = async () => {
		if (signingIn) return
		setSigningIn(true)
		try {
			await signInWithGoogle()
		} catch (error) {
			alert(error.message)
		} finally {
			setSigningIn(false)
		}
	}

	const handleLogout = async () => {
		try {
			await logout()
			setMenuOpen(false)
			alert("Successfully logged out!")
		} catch (error) {
			alert(error.message)
		}
	}
	const toggleDropdown = () => {
		setMenuOpen((prev) => !prev)
	}
	// const handleMenuOpen = (event) => {
	//   // setAnchorEl(event.currentTarget)
	//   setMenuOpen(true)
	// }

	// const handleMenuClose = () => {
	//   // setAnchorEl(null)
	//   setMenuOpen(false)
	// }

	return (
		<Box className="flex items-center space-x-3">
			{user ? (
				<Box className="relative flex items-center justify-center">
					<IconButton
						onClick={toggleDropdown}
						ref={buttonRef}
					>
						<Box className="w-12 h-12 sm:w-16 sm:h-16 bg-green-200 hover:bg-green-500 rounded-full flex items-center justify-center shadow-lg transition-all">
							<Avatar
								alt={user.displayName} // Use displayName for better compatibility
								src={user.photoURL}
								className="w-10 h-10 sm:w-12 sm:h-12" // Avatar style
							/>
						</Box>
					</IconButton>

					{menuOpen && (
						<Paper
							ref={menuRef}
							elevation={3}
							className="absolute right-0 mt-1 w-48 bg-gray-100 shadow-lg transition-transform duration-200 origin-top"
							style={{
								opacity: menuOpen ? 1 : 0,
								transform: menuOpen
									? "translateY(0) scale(1)"
									: "translateY(-6px) scale(0.98)",
							}}
						>
							<Box className="p-2">
								<Typography
									variant="body1"
									className="hover:text-blue-500 cursor-pointer"
								>
									Profile
								</Typography>
								<Typography
									variant="body1"
									className="hover:text-blue-500 cursor-pointer"
								>
									Settings
								</Typography>
								<Typography
									variant="body1"
									className="text-red-500 hover:text-red-700 cursor-pointer"
									onClick={handleLogout}
								>
									Sign Out
								</Typography>
							</Box>
						</Paper>
					)}

					{/* <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            TransitionComponent={Transition} // Use the custom transition
            sx={{
              '& .MuiPaper-root': {
                width: '15%',
              },
              zIndex: 2,
              // backgroundColor: '#1976d2',
              color: '#1976d2',
            }}
            anchorOrigin={{
              vertical: 'bottom', // Align to the bottom of the anchor
              horizontal: 'right', // Align to the right of the anchor
            }}
            // transformOrigin={{
            //   vertical: 'top', // Align to the top of the menu
            //   horizontal: 'right', // Align the right edge of the menu to the right side of the anchor
            // }}
          >
            <div className=" h-full w-full">
              <div className="h-6"></div>
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
            </div>
          </Menu> */}
				</Box>
			) : (
				<Button
					aria-label="Sign in with Google"
					onClick={handleGoogleSignIn}
					variant="contained"
					disabled={signingIn}
					sx={{
						backgroundColor: "#1a73e8",
						"&:hover": { backgroundColor: "#1664c5" },
						"&:disabled": { backgroundColor: "#9db9e6", color: "#f0f4fa" },
						textTransform: "none",
						fontWeight: 600,
						borderRadius: "999px",
						px: { xs: 1.75, sm: 2.25 },
						py: { xs: 0.5, sm: 0.75 },
						fontSize: { xs: "0.8rem", sm: "0.9rem" },
						gap: 1,
						boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
						"&:focus-visible": {
							outline: "3px solid #ffffff",
							outlineOffset: "2px",
						},
					}}
				>
					<AccountCircleIcon fontSize="small" />
					{signingIn ? "Signing in…" : "Sign in with Google"}
				</Button>
			)}
		</Box>
	)
}
export default GoogleLogin
