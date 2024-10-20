'use client'

import React, { useEffect, useState } from 'react'
import { deleteSetlist } from '../lib/dbService' // Import functions
import { useAuth } from '@/lib/AuthContext'
import SetlistPreview from './SetlistPreview'
import { Paper } from '@mui/material'
import { getSongsByIds } from '@/lib/logic'
const SetlistDisplay = ({ userId, setSongList }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { setlists, setSetlists } = useAuth()

  const handleDelete = async (setlistId) => {
    console.log('Deleting setlist:', setlistId)
    const result = await deleteSetlist(userId, setlistId)
    if (result.success) {
      // Remove the deleted setlist from the local state
      setSetlists(setlists.filter((setlist) => setlist.id !== setlistId))
    } else {
      console.error('Failed to delete setlist:', result.error)
    }
  }

  const handleSelectSetlist = async (setlist) => {
    const songIds = setlist.songs.map((song) => song.spotifyId)
    const songs = await getSongsByIds(songIds)
    setSongList(songs)
  }
  if (!setlists || setlists.length < 1) return <div>Loading setlists...</div>
  if (error) return <div>Error loading setlists: {error.message}</div>
  if (!userId) return <div>userId not found</div>
  return (
    <div>
      <h1>Your Setlists</h1>
      {setlists.length === 0 ? (
        <p>No setlists found.</p>
      ) : (
        <ul>
          {setlists.map((setlist) => (
            <li key={setlist.id} className="setlist-item">
              <div className="flex justify-center items-center">
                <SetlistPreview
                  setlist={setlist}
                  handleDelete={handleDelete}
                  handleSelectSetlist={handleSelectSetlist}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SetlistDisplay
