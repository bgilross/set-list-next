import React from 'react'
import { CardContent, Typography, CardMedia, Box } from '@mui/material'

const Song = ({ song }) => {
  return (
    <Box className="flex items-center">
      <CardMedia
        component="img"
        image={song.album.images[1].url}
        alt={`${song.album.name} cover`}
        sx={{
          width: 100,
          height: 100,
          borderRadius: '8px',
          marginRight: 2, // Space between image and text
        }}
      />
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          className="font-bold text-gray-800"
        >
          {song.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          className="text-gray-500"
        >
          {song.artists[0].name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          className="text-gray-500"
        >
          {song.album.name} - {new Date(song.album.release_date).getFullYear()}
        </Typography>
      </CardContent>
    </Box>
  )
}

export default Song
