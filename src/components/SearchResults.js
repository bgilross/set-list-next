import SongCard from './SongCard'
import Grid from '@mui/material/Grid2'

const SearchResults = ({ searchResults, setSongList }) => {
  return (
    <div className="p-7">
      {' '}
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
          {searchResults.map((result) => (
            <div key={result.id}>
              <SongCard
                song={result}
                setSongList={setSongList}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
export default SearchResults
