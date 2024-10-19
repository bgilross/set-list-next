//Spotify API Logic

import axios from 'axios'

const client_id = '4a25bc2ba5d942ceac4b96d09a9145a5'
const client_secret = '7cf97751b14e454cac92248db99b2f2b'

let tokenCache = {
  access_token: null,
  expires_at: null, // Store expiration time
}

export async function getToken() {
  console.log('Fetching token...')

  // If cached token is still valid, return it
  if (tokenCache.access_token && Date.now() < tokenCache.expires_at) {
    console.log('Using cached token...')
    return tokenCache.access_token
  }

  try {
    console.log('No Cache. Fetching new token...')
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    console.log('POST finished. Response:', response)

    const { access_token, expires_in } = response.data
    // Store token and expiration time
    tokenCache.access_token = access_token
    tokenCache.expires_at = Date.now() + expires_in * 2500

    return access_token
  } catch (error) {
    console.error('Error fetching Spotify token:', error)
    throw new Error('Unable to retrieve Spotify access token')
  }
}

// Function to search songs using the Spotify API
export async function searchSpotifySongs(query) {
  const token = await getToken() // Retrieve a valid token

  try {
    const result = await axios.get(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=6`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return result.data.tracks.items // Return search results
  } catch (error) {
    console.error('Error searching Spotify songs:', error)
    throw new Error('Unable to search Spotify songs')
  }
}

export async function getSongsByIds(songIds) {
  const token = await getToken() // Retrieve a valid token

  try {
    const result = await axios.get(
      `https://api.spotify.com/v1/tracks?ids=${songIds}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return result.data.tracks
  } catch (error) {
    console.error('Error searching Spotify songs:', error)
    throw new Error('Unable to search Spotify songs')
  }
}
