'use client'

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
} from '@mui/material'
import { useState, useEffect, forwardRef } from 'react'
import { auth } from '../lib/firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useAuth } from '../lib/AuthContext'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />
})

const GoogleLogin = ({ hover }) => {
  const [user, setUser] = useState(null)
  const { signInWithGoogle, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null) // Menu anchor
  const [menuOpen, setMenuOpen] = useState(false) // Menu open

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setMenuOpen(false)
      alert('Successfully logged out!')
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
    <Box className="flex items-center space-x-3 mr-16">
      {user ? (
        <Box className="relative flex items-center justify-center">
          <IconButton onClick={toggleDropdown}>
            <Box className="w-16 h-16 bg-green-200 hover:bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Avatar
                alt={user.displayName} // Use displayName for better compatibility
                src={user.photoURL}
                className="w-12 h-12" // Avatar style
              />
            </Box>
          </IconButton>

          {menuOpen && (
            <Paper
              elevation={3}
              className="absolute right-0 mt-1 w-48 bg-gray-100 shadow-lg transition-transform duration-300"
              style={{
                opacity: open ? 1 : 0,
                visibility: open ? 'visible' : 'hidden',
                transform: open ? 'translateY(0)' : 'translateY(-10px)', // Slide effect
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
          //   edge="end"
          color="inherit"
          //   size="large"
          aria-label="login"
          onClick={handleGoogleSignIn}
          className="flex items-center space-x-1 rounded-full shadow-md bg-white p-2 hover:bg-green-200 hover:scale-105 transition-all duration-200"
        >
          <AccountCircleIcon
            className="text-blue-600"
            fontSize="inherit"
            style={{ fontSize: '3rem' }}
          />
          <Typography variant="h5" className="text-blue-600">
            Login
          </Typography>
        </Button>
      )}
    </Box>
  )
}
export default GoogleLogin
