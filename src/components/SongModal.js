import { Modal, Typography, Box } from '@mui/material'
import SongCard from './SongCard'
import { useState } from 'react'
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'

const SongModal = ({ open, handleClose, song }) => {
  const [tags, setTags] = useState([])

  const handleChange = (tags) => {
    setTags(tags)
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  }
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <SongCard song={song} />
        <TagsInput value={tags} onChange={handleChange} />
      </Box>
    </Modal>
  )
}
export default SongModal
