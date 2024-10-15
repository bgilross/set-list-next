'use client'

import { useEffect, useState } from 'react'
import { searchSpotifySongs } from '@/lib/logic'
import SongCard from './SongCard'
import SongTable from './SongTable'
export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [songList, setSongList] = useState([])

  const handleInputChange = (e) => {
    setQuery(e.target.value)
    if (e.target.value.length < 3) {
      setSearchResults([])
    }
  }

  useEffect(() => {
    if (query.length > 3) {
      async function search() {
        const temp = await searchSpotifySongs(query)
        setSearchResults(temp)
      }
      search()

      //return a list of 5-10 'tracks/artists/albums' from spotify that match
      //passing the query into a function that will live in logic that will handle all the API calling
    }
  }, [query])
  return (
    <div className="w-full h-lvh p-4 flex flex-col justify-around">
      {searchResults.length > 0 ? (
        <div className="mt-8 flex flex-col items-center">
          {searchResults.map((result) => (
            <div className="w-[75%] p-1" key={result.id}>
              <SongCard song={result} setSongList={setSongList} />
            </div>
          ))}
        </div>
      ) : null}
      {songList.length > 0 ? <SongTable songList={songList} /> : null}
      <form className="w-full flex flex-col items-center">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a song..."
          className="p-2 border border-gray-300 rounded-lg shadow-sm w-96"
        />
      </form>
      <button onClick={() => console.log('SongList: ', songList)}>Check</button>
    </div>
  )
}
