"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import { useToast } from "@/lib/ToastContext"
import CreateShowModal from "@/components/modals/CreateShowModal"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

// Very small calendar placeholder — replace with full-featured calendar lib later
export default function Calendar({ className = "" }) {
  const today = new Date().toLocaleDateString()
  const [hovered, setHovered] = useState(null)
  const { user } = useAuth()
  const toast = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)

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
    // Refresh events after creation
    fetchEvents()
  }

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true)
      const res = await fetch(`/api/events`, {
        headers: { "x-artist-id": user?.uid || "" },
      })
      const j = await res.json()
      if (res.ok && j.success) setEvents(j.data || [])
    } catch (e) {
      console.warn("Failed to load events", e)
    } finally {
      setLoadingEvents(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div className={`p-4 rounded-lg border bg-white/80 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800">Upcoming</h3>
      <p className="text-sm text-gray-600 mt-2">Today: {today}</p>
      <div className="mt-4">
        <DayPicker
          mode="single"
          selected={selectedDate ? new Date(selectedDate) : undefined}
          onDayClick={(d) => {
            if (!d) return
            setSelectedDate(d.toISOString())
            // open modal for clicked date
            setModalOpen(true)
          }}
          modifiers={{ hasEvent: (date) => {
            return events.some(e => e.startsAt && new Date(e.startsAt).toDateString() === date.toDateString())
          } }}
          modifiersClassNames={{ hasEvent: "has-event" }}
        />

        <CreateShowModal open={modalOpen} onClose={() => setModalOpen(false)} defaultDate={selectedDate} onCreated={handleCreated} />

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700">Upcoming Shows</h4>
          {loadingEvents ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : events.length === 0 ? (
            <div className="text-sm text-gray-500">No upcoming shows.</div>
          ) : (
            <ul className="mt-2 space-y-2">
              {events.map((ev) => (
                <li key={ev.id} className="p-2 rounded-md bg-gray-50 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{ev.name}</div>
                    <div className="text-xs text-gray-500">{ev.startsAt ? new Date(ev.startsAt).toLocaleString() : "No date"}</div>
                  </div>
                  <div className="text-xs text-gray-600">{ev.setlist?.name || ""}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
