"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/AuthContext"
import { useToast } from "@/lib/ToastContext"
import CreateShowModal from "@/components/modals/CreateShowModal"

// Very small calendar placeholder — replace with full-featured calendar lib later
export default function Calendar({ className = "" }) {
  const today = new Date().toLocaleDateString()
  const [hovered, setHovered] = useState(null)
  const { user } = useAuth()
  const toast = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  const openCreateModal = (dayIndex) => {
    if (!user) {
      toast.push("Sign in as an artist to add a show", { type: "error" })
      return
    }
    const date = new Date()
    date.setDate(dayIndex + 1)
    setSelectedDate(date.toISOString())
    setModalOpen(true)
  }

  const handleCreated = (event) => {
    // Placeholder: could refresh calendar events / notify parent
    console.log("Created event", event)
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
            onClick={() => openCreateModal(i)}
            role="button"
            tabIndex={0}
            className={`relative p-2 rounded-md text-center transition-colors cursor-pointer select-none 
              ${hovered === i ? "bg-blue-50 ring-1 ring-blue-200" : "bg-gray-50"}`}
          >
            <div className="font-medium">{i + 1}</div>
          </div>
        ))}
      </div>
      <CreateShowModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selectedDate}
        onCreated={handleCreated}
      />
    </div>
  )
}
