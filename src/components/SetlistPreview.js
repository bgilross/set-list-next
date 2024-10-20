import { Paper } from '@mui/material'
import ScrollableText from './ScrollableText'

const SetlistPreview = ({ setlist, handleDelete, handleSelectSetlist }) => {
  return (
    <Paper
      onClick={() => handleSelectSetlist(setlist)}
      elevation={7}
      className="flex flex-col justify-center items-center m-8 bg-blue-500 rounded-3xl hover:scale-105 transition-all ease-in-out duration-700"
    >
      <div className="w-[100%] flex justify-between items-center p-1">
        <div className="w-1/3"></div>
        <div className="w-1/3 text-center text-green-200 text-md font-bold">
          {setlist.name}
        </div>
        <div className="w-1/3 flex justify-end pr-1">
          <Paper
            elevation={4}
            onClick={() => handleDelete(setlist.id)}
            className="group w-auto flex text-center items-center justify-center text-lg fun-delete-btn px-2 text-white font-bold bg-red-500 rounded-full
                         transition-transform duration-200 ease-in-out transform
                         hover:scale-110 hover:bg-red-700"
          >
            X
          </Paper>
        </div>
      </div>

      <div className="p-1 w-full">
        <div className="rounded-b-3xl">
          {setlist.songs.map((song, index) => (
            <div
              className="flex justify-between gap-1 rounded-b-3xl"
              key={song.name}
            >
              <div
                className={`w-[50%] bg-green-100 ${
                  index === 0
                    ? 'rounded-tl-lg'
                    : index === setlist.songs.length - 1
                    ? 'rounded-bl-3xl'
                    : ''
                }`}
              >
                <ScrollableText text={song.name} className="mr-2" />
              </div>
              <div
                className={`w-[50%] bg-green-100 ${
                  index === 0
                    ? 'rounded-tr-lg'
                    : index === setlist.songs.length - 1
                    ? 'rounded-br-3xl'
                    : ''
                }`}
              >
                <ScrollableText text={song.artist} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Paper>
  )
}

export default SetlistPreview
