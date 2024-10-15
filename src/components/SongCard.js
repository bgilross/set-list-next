import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardMedia, Box } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SongModal from './SongModal'
import Song from './Song'
import { useCallback } from 'react'

const SongCard = ({ song, setSongList }) => {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = useCallback(() => {
    console.log('handleClose called')
    setOpen(false)
  }, [setOpen])
  const handleButton = () => {
    handleOpen()
  }

  useEffect(() => {
    console.log('open state updated:', open)
  }, [open])

  return (
    <Card
      onClick={handleButton}
      className="w-fullrelative bg-white shadow-lg rounded-lg transform transition-transform duration-1000 ease-in-out hover:scale-110 hover:shadow-2xl flex cursor-pointer group border-4 border-transparent overflow-hidden hover:z-10" // Add hover:z-10
      sx={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        width: `100%`,
        display: 'flex',
        position: 'relative',
      }}
    >
      <SongModal
        song={song}
        open={open}
        handleClose={handleClose}
        setSongList={setSongList}
        setOpen={setOpen}
      />

      <div className="flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleOpen()
          }}
          className="flex items-center justify-center bg-green-500 rounded-l-lg transition-transform duration-300 transform w-12 h-full group-hover:bg-green-400" // Use 'group-hover' for hover
        >
          <AddIcon fontSize="large" className="text-white" />
        </button>
      </div>

      <Song song={song} setSongList={setSongList} />

      <div className="absolute inset-0 border-4 border-transparent group-hover:border-green-400 transition-all duration-300 rounded-lg transform scale-105 group-hover:scale-100" />
    </Card>
  )
}

export default SongCard
