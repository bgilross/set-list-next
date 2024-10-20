import { db } from './firebaseConfig'
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore'

export const deleteSetlist = async (userId, setlistId) => {
  console.log('Deleting setlist:', setlistId)
  console.log('userId:', userId)

  try {
    const setlistRef = doc(db, 'users', userId, 'setlists', setlistId)
    await deleteDoc(setlistRef) // Delete the document
    console.log(`Setlist ${setlistId} deleted successfully.`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting setlist:', error)
    return { success: false, error }
  }
}

export const updateUserSongs = async (userId, songs) => {
  const batch = writeBatch(db)

  // Loop through each song to check if it exists and update accordingly
  for (const song of songs) {
    const {
      id: spotifyId,
      name: songName,
      userTags = [],
      notes = '',
      dateCreated = new Date(),
    } = song
    const songRef = doc(db, `users/${userId}/songs/${spotifyId}`)

    const songSnap = await getDoc(songRef)

    if (songSnap.exists()) {
      // If the song already exists, merge tags and update `lastEdited`
      // const existingTags = songSnap.data().tags || []
      // const mergedTags = Array.from(new Set([...existingTags, ...tags])) // Remove duplicates

      batch.update(songRef, {
        name: songName,
        tags: userTags,
        notes: notes || songSnap.data().notes, // Keep existing notes if new notes are empty
        lastEdited: new Date().toISOString(),
      })
    } else {
      // If the song doesn't exist, create a new document with initial data
      batch.set(songRef, {
        name: songName,
        id: spotifyId,
        userTags,
        notes,
        dateCreated: new Date().toISOString(),
        lastEdited: new Date().toISOString(),
      })
    }
  }

  // Commit the batch operation
  try {
    await batch.commit()
    console.log('User songs successfully updated!')
  } catch (error) {
    console.error('Error updating user songs:', error)
  }
}

export const saveSetlist = async (userId, songList, setlistId, setlistName) => {
  console.log(
    'Running saveSetList: uID, songLIst, setListID, setListName: ',
    userId,
    songList,
    setlistId,
    setlistName
  )
  const songs = songList.map((song) => ({
    spotifyId: song.id,
    dateAdded: new Date().toISOString(),
    name: song.name,
    artist: song.artists[0].name,
    album: song.album.name,
    year: song.album.release_date.slice(0, 4),
  }))

  const setlistRef = setlistId
    ? doc(db, 'users', userId, 'setlists', setlistId)
    : doc(collection(db, 'users', userId, 'setlists'))

  const setlistData = {
    name: setlistName || 'Untitled Setlist', // Fallback to prevent undefined values
    songs: songs.length ? songs : [], // Ensure songs is always an array
  }

  if (setlistId) {
    setlistData.lastUpdated = new Date().toISOString()
  } else {
    setlistData.dateCreated = new Date().toISOString()
  }
  try {
    await updateUserSongs(userId, songList)
    await setDoc(setlistRef, setlistData, { merge: true })
    console.log('Setlist saved successfully')
    return { success: true }
  } catch (error) {
    console.error('Error saving setlist:', error)
    return { success: false, error }
  }
}

export const getUserSongs = async (userId) => {
  console.log('Running getUserSongs: userId: ', userId)
  const songsRef = collection(db, 'users', userId, 'songs')

  try {
    const querySnapshot = await getDocs(songsRef)
    const songs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    console.log('Songs:', songs)
    return { success: true, data: songs }
  } catch (error) {
    console.error('Error retrieving songs:', error)
    return { success: false, error }
  }
}
export const getSetlists = async (userId) => {
  console.log('Running getSetlists: userId: ', userId)
  console.log('db: ', db)
  const setlistsRef = collection(db, 'users', userId, 'setlists')

  try {
    const querySnapshot = await getDocs(setlistsRef)
    const setlists = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    // console.log('Query snapshot:', querySnapshot)
    // console.log('query snapshot docs: ', querySnapshot.docs)
    // console.log('Setlists:', setlists)
    // console.log('id? : ', setlists[0].id)
    return { success: true, data: setlists }
  } catch (error) {
    console.error('Error retrieving setlists:', error)
    return { success: false, error }
  }
}

export const getSetlist = async (userId, setlistId) => {
  const setlistRef = doc(db, 'users', userId, 'setlists', setlistId)

  try {
    const docSnap = await getDoc(setlistRef)
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() }
    } else {
      return { success: false, message: 'No such setlist found' }
    }
  } catch (error) {
    console.error('Error retrieving setlist:', error)
    return { success: false, error }
  }
}

export const updateSetlist = async (userId, setlistId, updatedData) => {
  const setlistRef = doc(db, 'users', userId, 'setlists', setlistId)

  try {
    await updateDoc(setlistRef, updatedData)
    return { success: true }
  } catch (error) {
    console.error('Error updating setlist:', error)
    return { success: false, error }
  }
}
