// import React from 'react'
// import { Card, CardContent, Button, CardMedia, Box } from '@mui/material'
// import Song from './Song'
// import SongModal from './SongModal'

// const SongCard = ({ song }) => {
//   const [open, setOpen] = React.useState(false)
//   const handleOpen = () => setOpen(true)
//   const handleClose = () => setOpen(false)

//   const handleButton = () => {
//     handleOpen()
//   }

//   return (
//     <Card
//       className="relative p-4 bg-white shadow-lg rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
//       sx={{
//         maxWidth: 345,
//         backgroundColor: 'white',
//         borderRadius: '0.75rem',
//       }}
//     >
//       <SongModal song={song} open={open} handleClose={handleClose} />

//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleButton}
//         className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 transform hover:scale-110 transition-all duration-300 shadow-md"
//       >
//         Add to List
//       </Button>
//       <Box>

//         <CardContent className="relative z-10">
//           <Song song={song} />
//         </CardContent>
//       </Box>
//       {/* <CardMedia
//         component="img"
//         height="64"
//         maxWidth="64"
//         s={{ heigh: 64 }}
//         image={song.album.images[1].url}
//         alt={`${song.album.name} cover`}
//         className="rounded-lg"
//       />
//       <CardContent className="relative z-10">
//         <Song song={song} />
//       </CardContent> */}
//     </Card>
//   )
// }
// export default SongCard
import React from 'react'
import { Card, CardContent, CardMedia, Box } from '@mui/material'
import AddIcon from '@mui/icons-material/Add' // Material UI Add Icon
import SongModal from './SongModal'
import Song from './Song'

const SongCard = ({ song }) => {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleButton = () => {
    handleOpen()
  }

  return (
    <Card
      onClick={handleButton} // Make the whole card clickable
      className="relative bg-white shadow-lg rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl flex cursor-pointer group border-4 border-transparent overflow-hidden hover:z-10" // Add hover:z-10
      sx={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        maxWidth: 500, // Control card's width
        display: 'flex', // Horizontal layout
        position: 'relative',
      }}
    >
      <SongModal song={song} open={open} handleClose={handleClose} />

      {/* Always Visible Add Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation() // Prevent the card's onClick event from firing
            handleOpen() // Open the modal
          }}
          className="flex items-center justify-center bg-green-500 rounded-l-lg transition-transform duration-300 transform w-12 h-full group-hover:bg-green-400" // Use 'group-hover' for hover
        >
          <AddIcon fontSize="large" className="text-white" />
        </button>
      </div>

      {/* Album Image */}
      <CardMedia
        component="img"
        image={song.album.images[1].url}
        alt={`${song.album.name} cover`}
        sx={{
          width: 100, // Image size
          height: 100, // Image size
          borderRadius: '8px',
          marginRight: 2,
        }}
        className="rounded-lg"
      />

      {/* Song Details */}
      <Box className="flex-grow p-2">
        <CardContent>
          <Song song={song} />
        </CardContent>
      </Box>

      {/* Outline Effect */}
      <div className="absolute inset-0 border-4 border-transparent group-hover:border-green-400 transition-all duration-300 rounded-lg transform scale-105 group-hover:scale-100" />
    </Card>
  )
}

export default SongCard
