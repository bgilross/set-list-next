'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db, googleProvider } from './firebaseConfig'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { setDoc, doc, getDoc } from 'firebase/firestore'
import { getSetlists, getUserSongs } from './dbService'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Track loading state
  const [setlists, setSetlists] = useState([])
  const [userSongs, setUserSongs] = useState([])

  // Listen to Auth state changes and set the user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user) // Set the user if authenticated
      } else {
        setUser(null)
      }
      setLoading(false) // Loading complete
    })

    return () => unsubscribe()
  }, [])

  // Fetch setlists when the user state changes
  useEffect(() => {
    const getData = async () => {
      if (!user) return // Ensure user exists before fetching data

      try {
        const tempSetlists = await getSetlists(user.uid)
        setSetlists(tempSetlists.data)
        console.log('getting user Songs: user.uid: ', user.uid)
        const tempSongs = await getUserSongs(user.uid)
        console.log('tempSongs: ', tempSongs.data)
        setUserSongs(tempSongs.data)
        console.log('Setlists:', tempSetlists.data)
      } catch (error) {
        console.error('Error fetching setlists:', error)
      }
    }

    if (!loading && user) {
      getData() // Only fetch setlists if loading is complete and user exists
    }
  }, [user, loading])

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      setUser(result.user)

      // Check or create user in Firestore
      const userRef = doc(db, 'users', result.user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        const userData = {
          displayName: result.user.displayName,
          email: result.user.email,
          createdAt: new Date().toISOString(),
          userId: result.user.uid,
        }
        await setDoc(userRef, userData)
        console.log('User document created successfully:', result.user.uid)
      } else {
        console.log('User document already exists:', result.user.uid)
      }

      return result.user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setlists,
        signInWithGoogle,
        logout,
        loading,
        setSetlists,
        userSongs,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
