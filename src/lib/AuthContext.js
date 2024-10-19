'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db, googleProvider } from './firebaseConfig'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { setDoc, doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      setUser(result.user)

      //check/create user in firestore
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
        console.log(
          'User document created successfully for : ',
          result.user.uid
        )
      } else {
        console.log('User document already exists for : ', result.user.uid)
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
    <AuthContext.Provider value={{ user, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
