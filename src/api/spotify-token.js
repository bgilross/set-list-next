import axios from 'axios'

let tokenCache = {
  access_token: null,
  expires_at: null,
}

export default async function handler(req, res) {
  const client_id = process.env.SPOTIFY_CLIENT_ID
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET

  if (tokenCache.access_token && Date.now() < tokenCache.expires_at) {
    return res.status(200).json({ access_token: tokenCache.access_token })
  }

  try {
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

    const expires_in = response.data.expires_in
    tokenCache.access_token = response.data.access_token
    tokenCache.expires_at = Date.now() + expires_in * 1000

    return res.status(200).json({ access_token: tokenCache.access_token })
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch token' })
  }
}
