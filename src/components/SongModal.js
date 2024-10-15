import { Modal, Typography, Box, Button } from '@mui/material'
import Song from './Song'
import { use, useState } from 'react'
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'

const SongModal = ({
  open,
  handleClose,
  song,
  setSongList,
  setOpen,
  isOpen,
}) => {
  const [tags, setTags] = useState([])
  const [openModal, setOpenModal] = useState(false)

  const handleChange = (tags) => {
    setTags(tags)
  }

  const handleClick = () => {
    const tempSong = { ...song, userTags: tags }

    setSongList((prev) => [...prev, tempSong])
    handleClose()
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
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
        <Song song={song} />
        <TagsInput value={tags} onChange={handleChange} />
        <Button onClick={handleClick}>Add Song</Button>
      </Box>
    </Modal>
  )
}
export default SongModal
