'use client'

import SearchBar from './SearchBar'
import SearchResults from './SearchResults'
import { useState } from 'react'
import TableDisplay from './TableDisplay'
import { Button } from '@mui/material'
import { useAuth } from '@/lib/AuthContext'
import { getSetlists } from '@/lib/dbService'
import SetlistDisplay from './SetlistDisplay'

const Main = () => {
  const [searchResults, setSearchResults] = useState([])
  const [songList, setSongList] = useState([])

  const { user, setlists, userSongs } = useAuth()

  const handleClick = () => {
    console.log('user:', user)
    console.log('songList:', songList)
    console.log('searchResults:', searchResults)
    console.log('attempting to get setlist data...')
    getSetlists(user.uid)
    console.log('userSongs  :', userSongs)
  }

  return (
    <div className="flex flex-col justify-center items-center h-full bg-blue-100">
      {user?.uid && (
        <>
          <SetlistDisplay
            setlists={setlists}
            userId={user.uid}
            setSongList={setSongList}
          />
        </>
      )}
      <Button onClick={handleClick}>CHECK</Button>
      <SearchBar setSearchResults={setSearchResults} />
      <SearchResults searchResults={searchResults} setSongList={setSongList} />
      <TableDisplay songList={songList} />
    </div>
  )
}
export default Main
