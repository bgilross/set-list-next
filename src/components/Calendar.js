"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/AuthContext"
import { useToast } from "@/lib/ToastContext"

// Very small calendar placeholder — replace with full-featured calendar lib later
export default function Calendar({ className = "" }) {
  const today = new Date().toLocaleDateString()
  const [hovered, setHovered] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const { user } = useAuth()
  const toast = useToast()

  const handleAddShow = async (dayIndex) => {
    if (!user) {
      toast.push("Sign in as an artist to add a show", { type: "error" })
      return
    }
    const date = new Date()
    date.setDate(dayIndex + 1)
    // Simple name and start date
    const payload = {
      name: `Show - ${date.toDateString()}`,
      startsAt: date.toISOString(),
    }
    try {
      setLoadingId(dayIndex)
      const res = await fetch(`/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": user.uid,
          "x-display-name": user.displayName || "Artist",
        },
        body: JSON.stringify(payload),
      })
      const j = await res.json()
      if (!res.ok || !j.success) {
        throw new Error(j.error || "Failed to create event")
      }
      toast.push("Show created", { type: "success" })
    } catch (e) {
      console.error(e)
      toast.push(`Error creating show: ${e.message || e}`, { type: "error" })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className={`p-4 rounded-lg border bg-white/80 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800">Upcoming</h3>
      <p className="text-sm text-gray-600 mt-2">Today: {today}</p>
      <div className="mt-4 grid grid-cols-7 gap-2 text-sm">
        {[...Array(28)].map((_, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`relative p-2 rounded-md text-center transition-colors cursor-default 
              ${hovered === i ? "bg-blue-50 ring-1 ring-blue-200" : "bg-gray-50"}`}
          >
            <div className="font-medium">{i + 1}</div>
            {hovered === i && (
              <div className="absolute right-1 top-1">
                <button
                  onClick={() => handleAddShow(i)}
                  disabled={loadingId === i}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md"
                >
                  {loadingId === i ? "..." : "Add show"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
