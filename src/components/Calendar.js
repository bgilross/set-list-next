"use client"

import React from "react"

// Very small calendar placeholder — replace with full-featured calendar lib later
export default function Calendar({ className = "" }) {
  const today = new Date().toLocaleDateString()
  return (
    <div className={`p-4 rounded-lg border bg-white/80 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800">Upcoming</h3>
      <p className="text-sm text-gray-600 mt-2">Today: {today}</p>
      <div className="mt-4 grid grid-cols-7 gap-2 text-sm">
        {[...Array(28)].map((_, i) => (
          <div key={i} className="p-2 rounded-md bg-gray-50 text-center">
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}
