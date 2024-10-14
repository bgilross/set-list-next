'use client'

import { useState } from 'react'
import axios from 'axios'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [songs, setSongs] = useState([])

  const searchSongs = async (e) => {
    e.preventDefault()

    const tokenResponse = await axios.get('/api/spotify-token')
    const token = tokenResponse.data.access_token

    const result = await axios.get(
      `https://api.spotify.com/v1/search?q=${query}&type=track`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    setSongs(result.data.tracks.items)
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  return (
    <div className="w-full p-4">
      <form
        onSubmit={searchSongs}
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
        {songs.length > 0 && (
          <ul>
            {songs.map((song) => (
              <li
                key={song.id}
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              >
                <img
                  src={song.album.images[0]?.url}
                  alt={song.name}
                  className="w-12 h-12 mr-4"
                />
                <div>
                  <p className="font-bold">{song.name}</p>
                  <p className="text-gray-500">{song.artists[0].name}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
