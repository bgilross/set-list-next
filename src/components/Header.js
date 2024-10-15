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

        {/* Right: User Icon / Login */}
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
              onClick={onLogin}
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
      </Toolbar>
    </AppBar>
  )
}

export default Header
