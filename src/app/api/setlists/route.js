import { NextResponse } from 'next/server'

// POST /api/setlists  { id?, name, songs: [] }
export async function POST(req) {
  try {
    const body = await req.json()
    const { id = null, name, songs = [] } = body || {}
  const firebaseUid = req.headers.get('x-artist-id') || body.artistId
  if (!firebaseUid) return NextResponse.json({ error: 'artistId missing' }, { status: 401 })

  const { upsertSongs, saveSetlistPg, ensureArtist, listSetlistsPg } = await import('@/lib/pgService')
  const artist = await ensureArtist(firebaseUid, body.displayName || 'Artist')
  const artistId = artist.id

    const pgSongs = (Array.isArray(songs) ? songs : []).map((s) => ({
      spotifyId: s.id || s.spotifyId || null,
      name: s.name,
      artistName: s.artists?.[0]?.name || s.artist || null,
      album: s.album?.name || s.album || null,
      year: s.album?.release_date ? parseInt(String(s.album.release_date).slice(0,4)) : s.year || null,
      userTags: s.userTags || s.tags || [],
      notes: s.notes || '',
    }))
    const inserted = await upsertSongs(artistId, pgSongs)
    const songIds = inserted.map((s) => s.id)
    const saved = await saveSetlistPg(artistId, { id, name: name || 'Untitled', songIds })
    return NextResponse.json({ success: true, data: saved })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

// GET /api/setlists -> list setlists for artist
export async function GET(req) {
  try {
    const firebaseUid = req.headers.get('x-artist-id')
    if (!firebaseUid) return NextResponse.json({ error: 'artistId missing' }, { status: 401 })
    const { ensureArtist, listSetlistsPg } = await import('@/lib/pgService')
    const artist = await ensureArtist(firebaseUid, 'Artist')
    const data = await listSetlistsPg(artist.id)
    return NextResponse.json({ success: true, data })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
