// lib/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBHYnNjhfh0-1TXuFmC501AN2nkuMGcpFE',
  authDomain: 'evenmoresongsandstuff.firebaseapp.com',
  projectId: 'evenmoresongsandstuff',
  storageBucket: 'evenmoresongsandstuff.appspot.com',
  messagingSenderId: '101643002839',
  appId: '1:101643002839:web:8c2f326b4a25b6f2f36192',
  measurementId: 'G-KEWTTXEFY2',
}
// Initialize Firebase (Check if it's already initialized to avoid multiple initializations)
const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider }
