import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from './firebaseConfig'

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    return user
  } catch (error) {
    throw new Error(error.message)
  }
}

// Function to sign out
export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    throw new Error(error.message)
  }
}
