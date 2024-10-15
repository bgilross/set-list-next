import * as React from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'
import TagsInput from 'react-tagsinput'

const columns = [
  { field: 'title', headerName: 'Title', width: 130 },
  { field: 'artist', headerName: 'Artist', width: 130 },
  { field: 'album', headerName: 'Album', width: 130 },
  { field: 'year', headerName: 'Year', type: 'number', widht: 40 },

  {
    field: 'tags',
    headerName: 'Tags',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 200,
  },
]

const paginationModel = { page: 0, pageSize: 5 }

export default function SongTable({ songList }) {
  const [rows, setRows] = React.useState([])

  React.useEffect(() => {
    let tempRows = []
    songList.forEach((song) => {
      const row = {
        id: song.id,
        title: song.name,
        artist: song.artists[0].name,
        album: song.album.name,
        year: song.album.release_date.slice(0, 4),
        tags: song.userTags,
      }
      tempRows.push(row)
    })
    setRows(tempRows)
  }, [songList])
  return (
    <div className="flex">
      {songList.length > 0 ? (
        <div>
          <Paper
            className="bg-green-100"
            sx={{ height: '100%', width: '100%' }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10]}
              checkboxSelection
              sx={{ border: 0 }}
            />
          </Paper>
        </div>
      ) : null}
    </div>
  )
}
