import { prisma } from './prismaClient'

// Utility: ensure artist row exists (maps firebase uid)
export async function ensureArtist(firebaseUid, displayName) {
  if (!firebaseUid) throw new Error('firebaseUid required')
  return prisma.artist.upsert({
    where: { firebaseUid },
    update: { displayName },
    create: { firebaseUid, displayName },
  })
}

// Upsert songs (array of simplified song objects)
export async function upsertSongs(artistId, songs) {
  if (!Array.isArray(songs) || !songs.length) return []
  const results = []
  for (const s of songs) {
    const { id, spotifyId, name, artistName, album, year, userTags, notes } = s
    // natural key attempt: spotifyId if present else cuid (create)
    if (spotifyId) {
      const existing = await prisma.song.findFirst({ where: { artistId, spotifyId } })
      if (existing) {
        results.push(
          await prisma.song.update({
            where: { id: existing.id },
            data: { name: name || existing.name, artistName, album, year, userTags, notes },
          })
        )
        continue
      }
    }
    results.push(
      await prisma.song.create({
        data: {
          artistId,
          spotifyId: spotifyId || null,
            name: name || 'Untitled',
            artistName: artistName || null,
            album: album || null,
            year: year || null,
            userTags: userTags || [],
            notes: notes || null,
        },
      })
    )
  }
  return results
}

// Create or update setlist with ordered songs
export async function saveSetlistPg(artistId, { id, name, songIds }) {
  if (!artistId) throw new Error('artistId required')
  if (!Array.isArray(songIds)) songIds = []
  const isUpdate = Boolean(id)
  return prisma.$transaction(async (tx) => {
    let setlist
    if (isUpdate) {
      setlist = await tx.setlist.update({ where: { id }, data: { name } })
      await tx.setlistSong.deleteMany({ where: { setlistId: id } })
    } else {
      setlist = await tx.setlist.create({ data: { artistId, name: name || 'Untitled' } })
      id = setlist.id
    }
    // insert ordering
    if (songIds.length) {
      await tx.setlistSong.createMany({
        data: songIds.map((songId, idx) => ({ setlistId: id, songId, position: idx })),
        skipDuplicates: true,
      })
    }
    const full = await tx.setlist.findUnique({
      where: { id },
      include: { songs: { include: { song: true }, orderBy: { position: 'asc' } } },
    })
    return {
      id: full.id,
      name: full.name,
      isActive: full.isActive,
      songs: full.songs.map((r) => ({
        id: r.song.id,
        name: r.song.name,
        artist: r.song.artistName,
        spotifyId: r.song.spotifyId,
        userTags: r.song.userTags,
        notes: r.song.notes,
      })),
    }
  })
}

export async function listSetlistsPg(artistId) {
  const lists = await prisma.setlist.findMany({
    where: { artistId },
    orderBy: { updatedAt: 'desc' },
    include: { songs: true },
  })
  return lists.map((l) => ({
    id: l.id,
    name: l.name,
    isActive: l.isActive,
    songCount: l.songs.length,
  }))
}

export async function getSetlistPg(artistId, setlistId) {
  const s = await prisma.setlist.findFirst({
    where: { id: setlistId, artistId },
    include: { songs: { include: { song: true }, orderBy: { position: 'asc' } } },
  })
  if (!s) return null
  return {
    id: s.id,
    name: s.name,
    songs: s.songs.map((r) => ({
      id: r.song.id,
      name: r.song.name,
      artist: r.song.artistName,
      spotifyId: r.song.spotifyId,
      userTags: r.song.userTags,
      notes: r.song.notes,
    })),
  }
}

export async function deleteSetlistPg(artistId, setlistId) {
  await prisma.$transaction(async (tx) => {
    await tx.setlistSong.deleteMany({ where: { setlistId } })
    await tx.setlist.delete({ where: { id: setlistId } })
  })
  return { success: true }
}

// --- Song Requests ---
// Create a new song request. If songId provided it must belong to artist.
export async function createSongRequestPg({ artistId, setlistId = null, songId = null, rawTitle = null, audienceRef = null }) {
  if (!artistId) throw new Error('artistId required')
  if (!songId && !rawTitle) throw new Error('songId or rawTitle required')
  // Basic validation (ensure song belongs to artist if provided)
  if (songId) {
    const song = await prisma.song.findFirst({ where: { id: songId, artistId } })
    if (!song) throw new Error('Song not found for artist')
  }
  const req = await prisma.songRequest.create({
    data: {
      artistId,
      setlistId,
      songId,
      rawTitle,
      status: 'PENDING',
      audienceRef,
    },
    include: { song: true },
  })
  return serializeRequest(req)
}

export async function updateSongRequestStatusPg(artistId, requestId, status) {
  const allowed = ['PENDING','ACCEPTED','REJECTED','PLAYED','CANCELLED']
  if (!allowed.includes(status)) throw new Error('Invalid status')
  const req = await prisma.songRequest.update({
    where: { id: requestId },
    data: { status },
    include: { song: true },
  })
  if (req.artistId !== artistId) throw new Error('Not authorized')
  return serializeRequest(req)
}

export async function listSongRequestsPg(artistId, { status = null, limit = 100 } = {}) {
  const where = { artistId }
  if (status) where.status = status
  const reqs = await prisma.songRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { song: true },
  })
  return reqs.map(serializeRequest)
}

function serializeRequest(r) {
  return {
    id: r.id,
    status: r.status,
    createdAt: r.createdAt,
    song: r.song
      ? {
          id: r.song.id,
          name: r.song.name,
          artist: r.song.artistName,
          spotifyId: r.song.spotifyId,
        }
      : null,
    rawTitle: r.rawTitle,
    setlistId: r.setlistId,
    audienceRef: r.audienceRef,
  }
}
