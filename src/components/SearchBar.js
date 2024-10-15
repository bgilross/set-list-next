'use client'

import { useEffect, useState } from 'react'
import { searchSpotifySongs } from '@/lib/logic'
import Song from './Song'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const temp = await searchSpotifySongs(query)
    setSearchResults(temp)
    console.log('temp: ', temp)
  }

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
    <div className="w-full p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a song..."
          className="p-2 border border-gray-300 rounded-lg shadow-sm w-96"
        />
        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Search
        </button>
      </form>

      <div className="mt-8">
        {searchResults.map((result) => (
          <div key={result.id}>
            <Song song={result} />
            <p>Song: {result.name}</p>
            <p>Artist: {result.artists[0].name}</p>
            <p>Album: {result.album.name}</p>
            <p>Year: {new Date(result.album.release_date).getFullYear()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
