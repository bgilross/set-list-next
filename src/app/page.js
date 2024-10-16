'use client'
import SpreadWord from '@/components/SpreadWord'
import Main from '../components/Main'
import { AuthProvider } from '../lib/AuthContext'

export default function Home() {
  const letters = ['h', 'e', 'l', 'l', 'o']
  return (
    <div className="h-full">
      <Main />
    </div>
  )
}
