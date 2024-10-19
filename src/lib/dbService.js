import { db } from './firebaseConfig'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

export const saveSetlist = async (userId, setlistData, setlistId) => {
  const setlistRef = setlistId
    ? doc(db, 'users', userId, 'setlists', setlistId)
    : doc(collection(db, 'users', userId, 'setlists'))
  try {
    await setDoc(setlistRef, setlistData, { merge: true })
    return { success: true }
  } catch (error) {
    console.error('Error saving setlist:', error)
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
