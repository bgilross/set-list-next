'use client'

import SearchBar from './SearchBar'
import SearchResults from './SearchResults'
import { useState } from 'react'
import TableDisplay from './TableDisplay'

const Main = () => {
  const [searchResults, setSearchResults] = useState([])
  const [songList, setSongList] = useState([])
  const [user, setUser] = useState(null)

  return (
    <div className="flex flex-col justify-center items-center h-full bg-blue-100">
      <button
        onClick={() => {
          console.log(songList)
        }}
      >
        CHECK
      </button>
      <SearchBar setSearchResults={setSearchResults} />
      <SearchResults searchResults={searchResults} setSongList={setSongList} />
      <TableDisplay songList={songList} />
    </div>
  )
}
export default Main
