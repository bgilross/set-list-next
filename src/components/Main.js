'use client'

import SearchBar from './SearchBar'
import SearchResults from './SearchResults'
import SongTable from './SongTable'
import { useState } from 'react'

const Main = () => {
  const [searchResults, setSearchResults] = useState([])
  const [songList, setSongList] = useState([])

  return (
    <div className="flex flex-col justify-center items-center h-full bg-blue-100">
      <SearchBar setSearchResults={setSearchResults} />
      <SearchResults searchResults={searchResults} setSongList={setSongList} />
      <SongTable songList={songList} />
    </div>
  )
}
export default Main
