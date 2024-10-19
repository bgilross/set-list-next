import SortableTable from './SortableTable'
import { Paper } from '@mui/material'
const TableDisplay = ({ songList }) => {
  const datExample = [
    {
      name: 'Song Name',
      artist: 'Artist Name',
      album: 'Album Name',
      year: 'Year',
      tags: ['tag1', 'tag2', 'tag3'],
    },
  ]

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
          {item.userTags.map((tag, index) => (
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

  return (
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
  )
}
export default TableDisplay
