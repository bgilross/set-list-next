import SortableTable from './SortableTable'
import { Paper } from '@mui/material'
import { useState } from 'react'
import { Button } from '@mui/material'
import Input from './TextInput'
import { saveSetlist } from '@/lib/dbService'
import { useAuth } from '@/lib/AuthContext'

const TableDisplay = ({ songList }) => {
  const [setlistName, setSetlistName] = useState('')
  const { user } = useAuth()

  const handleSaveSetlist = async () => {
    if (!setlistName) {
      alert('Please provide a setlist name.')
      return
    }

    if (!songList || songList.length === 0) {
      alert('Please add at least one song to the setlist.')
      return
    }

    const result = await saveSetlist(user.uid, songList, null, setlistName)

    if (result.success) {
      alert('Setlist saved successfully!')
    } else {
      alert(`Error: ${result.error.message}`)
    }

    console.log('finishing saveSetlist, updating setlist State')
  }

  const config = [
    {
      label: 'Name',
      render: (item) => item.name,
      sortValue: (item) => item.name,
    },
    {
      label: 'Artist',
      render: (item) => item.artists[0].name,
      sortValue: (item) => item.artists[0].name,
    },
    {
      label: 'Album',
      render: (item) => item.album.name,
      sortValue: (item) => item.album.name,
    },
    {
      label: 'Year',
      render: (item) => item.album.release_date.slice(0, 4),
      sortValue: (item) => item.album.release_date.slice(0, 4),
    },
    {
      label: 'Tags',
      render: (item) => (
        <div className="flex flex-wrap gap-2">
          {item.userTags?.map((tag, index) => (
            <span key={index} className="bg-gray-200 text-sm px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      ),
    },
  ]

  const keyFn = (item) => {
    return item.name
  }
  if (!songList || songList.length === 0) {
    return null
  }
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Paper elevation={3} className="m-4 w-[60%] rounded-lg">
        <SortableTable
          data={songList}
          config={config}
          keyFn={keyFn}
          headerRowClassName="bg-blue-500 text-green-200"
          tableClassName="bg-green-100"
          rowsClassName="p-2"
          className="w-full rounded-lg"
        />
      </Paper>
      <div className=" flex flex-col justify-center items-center gap-2">
        <Input
          value={setlistName}
          onChange={(e) => setSetlistName(e.target.value)}
          inputClassName="text-center"
          placeHolder={'Setlist Name'}
        />
        <Button
          className="bg-blue-500 text-green-200 font-bold ml-2 p-2 rounded-lg"
          onClick={handleSaveSetlist}
        >
          Save Setlist
        </Button>
      </div>
    </div>
  )
}
export default TableDisplay
