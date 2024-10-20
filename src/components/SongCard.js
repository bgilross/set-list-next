import React, { useEffect, useState } from 'react'
import { Card, Paper } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SongModal from './SongModal'
import Song from './Song'
import { useCallback } from 'react'

const SongCard = ({ song, setSongList }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = useCallback(() => {
    console.log('handleClose called')
    setOpen(false)
  }, [setOpen])
  const handleButton = () => {
    if (open) {
      return
    }
    handleOpen()
  }

  useEffect(() => {
    console.log('open state updated:', open)
  }, [open])

  return (
    <Paper
      elevation={4}
      className="p-1 group hover:scale-105  transform transition-all
        duration-500 ease-in-out hover:bg-green-400 flex-1 h-full bg-blue-400 rounded-lg hover:z-10"
    >
      <Card
        onClick={handleButton}
        className="flex-1 h-full w-full relative shadow-lg rounded-lg transform transition-transform
        duration-500 ease-in-out hover:scale-105 hover:shadow-2xl flex cursor-pointer
        group border-transparent overflow-hidden hover:z-10  hover:bg-green-400 p-1" // Add hover:z-10
        sx={{
          borderRadius: '0.75rem',
          width: `100%`,
          display: 'flex',
          position: 'relative',
          borderWidth: '2px',
          backgroundColor: 'rgb(220 252 231 / var(--tw-bg-opacity))',
        }}
      >
        <SongModal
          song={song}
          open={open}
          isOpen={isOpen}
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
            className="flex items-center justify-center bg-green-100
            transition-transform duration-300 transform w-12 h-full rounded-l-lg group-hover:bg-green-400" // Use 'group-hover' for hover
          >
            <AddIcon
              fontSize="large"
              className="text-green-500 group-hover:text-white"
            />
          </button>
        </div>
        <Song song={song} setSongList={setSongList} />
        <div className="absolute inset-0 border-4 border-transparent group-hover:border-green-400 transition-all duration-300 rounded-lg transform scale-105 group-hover:scale-100" />
      </Card>
    </Paper>
  )
}

export default SongCard
