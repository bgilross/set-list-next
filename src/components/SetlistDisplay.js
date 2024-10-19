'use client'

import React, { useEffect, useState } from 'react'
import { getSetlists, deleteSetlist } from '../lib/dbService' // Import functions

const SetlistView = ({ userId }) => {
  const [setlists, setSetlists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch setlists on component mount
  useEffect(() => {
    const fetchSetlists = async () => {
      const result = await getSetlists(userId)
      if (result.success) {
        setSetlists(result.data) // Store setlists in state
      } else {
        setError(result.error) // Handle error
      }
      setLoading(false)
    }

    fetchSetlists()
  }, [userId])

  // Handle delete action
  const handleDelete = async (setlistId) => {
    const result = await deleteSetlist(userId, setlistId)
    if (result.success) {
      // Remove the deleted setlist from the local state
      setSetlists(setlists.filter((setlist) => setlist.id !== setlistId))
    } else {
      console.error('Failed to delete setlist:', result.error)
    }
  }

  if (loading) return <div>Loading setlists...</div>
  if (error) return <div>Error loading setlists: {error.message}</div>

  return (
    <div>
      <h1>Your Setlists</h1>
      {setlists.length === 0 ? (
        <p>No setlists found.</p>
      ) : (
        <ul>
          {setlists.map((setlist) => (
            <li key={setlist.id} className="setlist-item">
              <div>
                <strong>{setlist.name}</strong>
                <button onClick={() => handleDelete(setlist.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SetlistView
