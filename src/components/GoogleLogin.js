'use client'

import { Box, Button, Avatar, Typography } from '@mui/material'
import { useState, useEffect } from 'react'
import { signInWithGoogle, logout } from '../lib/auth'
import { auth } from '../lib/firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

const GoogleLogin = () => {
  const [user, setUser] = useState(null)

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
      alert('Successfully logged out!')
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <Box className="flex items-center space-x-3 mr-16">
      {user ? (
        <Avatar
          alt={user.name}
          src={user.photoURL}
          className="w-10 h-10 border-2 border-white"
        />
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
