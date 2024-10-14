import axios from 'axios'

export default async function handler(req, res) {
  const client_id = '4a25bc2ba5d942ceac4b96d09a9145a5'
  const client_secret = '7cf97751b14e454cac92248db99b2f2b'

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
    res.status(200).json({ access_token: response.data.access_token })
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch token' })
  }
}

const fetchAPItoken = async () => {
  var authParam = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:
      'grant_type=client_credentials&client_id=' +
      CLIENT_ID +
      '&client_secret=' +
      CLIENT_SECRET,
  }

  fetch('https://accounts.spotify.com/api/token', authParam)
    .then((result) => result.json())
    .then((data) => {
      return data.accessToken
    })
}
