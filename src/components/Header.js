'use client'

import React from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Button,
} from '@mui/material'
import { Box } from '@mui/system'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import WordSpread from './WordSpread'
import SpreadWord from './SpreadWord'
import { useState } from 'react'
import Login from './Login'
import GoogleLogin from './GoogleLogin'

const Header = ({ user, onLogin }) => {
  const [spreadWord, setSpreadWord] = useState(false)
  return (
    <AppBar
      position="sticky"
      className="bg-blue-600 shadow-2xl shadow-blue-900"
      sx={{
        borderBottomLeftRadius: '1rem',
        borderBottomRightRadius: '1rem',
        zIndex: 10,
      }}
      onMouseEnter={() => setSpreadWord(true)}
      onMouseLeave={() => setSpreadWord(false)}
    >
      <Toolbar className="relative flex justify-between px-6 py-4 h-20">
        {/* Left: Logo */}
        <Box className="flex space-x-3 w-full">
          {/* <img
            src="/logo.png"
            alt="Logo"
            className="w-12 h-12 rounded-full bg-white p-1"
          /> */}
          <div className="text-white font-bold text-xl w-full text-left">
            <SpreadWord spreadWord={spreadWord} word={'Set Lister'} />
          </div>
        </Box>
        <GoogleLogin />
        {/* <Login /> */}
        {/* Right: User Icon / Login */}
      </Toolbar>
    </AppBar>
  )
}

export default Header
