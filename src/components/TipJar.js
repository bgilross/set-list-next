"use client"

import React from "react"

export default function TipJar({ className = "" }) {
  return (
    <div className={`p-4 rounded-lg border bg-white/80 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800">Tip Jar</h3>
      <p className="text-sm text-gray-600 mt-2">Support the artist with a tip — placeholder.</p>

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
