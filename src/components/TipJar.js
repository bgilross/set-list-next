"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/AuthContext"

export default function TipJar({ className = "" }) {
  const [loading, setLoading] = useState(true)
  const [totalCents, setTotalCents] = useState(0)
  const [error, setError] = useState(null)

  const { user } = useAuth()

  useEffect(() => {
    let mounted = true
    const fetchTotal = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/tips", { headers: { "x-artist-id": user?.uid || "" } })
        const j = await res.json()
        if (!mounted) return
        if (res.ok && j.success) {
          setTotalCents(j.totalCents || 0)
        } else {
          setError(j.error || "Failed to load tips")
        }
      } catch (e) {
        if (!mounted) return
        setError(String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchTotal()
    return () => (mounted = false)
  }, [user?.uid])

  const dollars = (totalCents / 100).toFixed(2)

  return (
    <div className={`p-4 rounded-lg border bg-white/80 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800">Tip Jar</h3>
      {loading ? (
        <p className="text-sm text-gray-600 mt-2">Loading tips…</p>
      ) : error ? (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      ) : (
  <p className="text-sm text-gray-700 mt-2">You have earned <span className="font-semibold">${dollars}</span> in tips</p>
      )}

      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <input type="number" min="1" placeholder="$5" className="w-full px-3 py-2 border rounded-md" />
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md">Tip</button>
        </div>

        <div className="mt-4 text-sm text-gray-500">No payment integration configured.</div>
      </div>
    </div>
  )
}
