'use client'

import { useEffect, useState } from 'react'
import { searchSpotifySongs } from '@/lib/logic'
import SongCard from './SongCard'
import SongTable from './SongTable'
import BasicModal from './ModalTest'
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
      <div className="flex">
        {searchResults.length > 0 ? (
          <div className="mt-8 flex flex-col items-center h-[e]">
            {searchResults.map((result) => (
              <div className="w-[75%] p-1" key={result.id}>
                <SongCard song={result} setSongList={setSongList} />
              </div>
            ))}
          </div>
        ) : null}
        {songList.length > 0 ? (
          <div className="w-[50%]">
            <SongTable songList={songList} />
          </div>
        ) : null}
      </div>

      <div className="flex justify-center">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a song..."
          className="p-2 border border-gray-300 rounded-lg shadow-sm w-96"
        />
      </div>

      {/* <button onClick={() => console.log('SongList: ', songList)}>Check</button> */}
    </div>
  )
}
