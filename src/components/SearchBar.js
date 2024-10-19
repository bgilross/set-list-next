'use client'

import { useEffect, useState } from 'react'
import { searchSpotifySongs } from '@/lib/logic'
import SongCard from './SongCard'
import SongTable from './SongTable'
import BasicModal from './ModalTest'
import { Paper } from '@mui/material'
export default function SearchBar({ setSearchResults, searchResults }) {
  const [query, setQuery] = useState('')

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
    }
  }, [query])

  return (
    <Paper
      elevation={7}
      className="flex justify-center m-8 w-[90%] p-8 bg-blue-500 rounded-3xl group hover:scale-105 transition-all ease-in-out duration-700"
    >
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for a song..."
        className="
      p-3
      border border-gray-300
      rounded-lg
      w-96
      text-lg
      text-gray-700
      shadow-lg
      group
      group-hover:ring-2 group-hover:ring-blue-500
      focus:outline-none focus:ring-2 focus:ring-blue-500
      focus:scale-105 group-hover:scale-105
      transition-all duration-1000 ease-in-out
      group-hover:shadow-xl
      placeholder-gray-400
      focus:border-indigo-500
      bg-green-100
    "
      />
    </Paper>
  )
}
