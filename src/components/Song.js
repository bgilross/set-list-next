import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  Box,
} from '@mui/material'

import { useState } from 'react'

const Song = ({ song, onAddToList }) => {
  return (
    <div>
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
    </div>
  )
}

export default Song

// const Song = ({ song }) => {
//   return (
//     <div className="relative group p-6 bg-white rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
//
//       <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300 rounded-lg opacity-50 pointer-events-none"></div>

//
//       <div className="relative z-10">
//         <h3 className="text-xl font-bold text-gray-800">{song.title}</h3>
//         <p className="text-gray-500">{song.artist}</p>
//       </div>

//
//       <button
//         onClick={() => onAddToList(song)}
//         className="absolute bottom-4 right-4 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-110 hover:bg-blue-500"
//       >
//         Add to List
//       </button>
//     </div>
//   )
// }
// export default Song
