import SongCard from './SongCard'

const SearchResults = ({ searchResults, setSongList }) => {
  return (
    <div>
      {' '}
      {searchResults.length > 0 ? (
        <div className="mt-8 flex flex-col items-center h-[e]">
          {searchResults.map((result) => (
            <div className="w-[75%] p-1" key={result.id}>
              <SongCard song={result} setSongList={setSongList} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
export default SearchResults
