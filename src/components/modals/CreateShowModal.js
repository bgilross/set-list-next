"use client"

import React, { useState, useEffect, useRef } from "react"
import BaseModal from "./BaseModal"
import { useAuth } from "@/lib/AuthContext"
import { useToast } from "@/lib/ToastContext"

export default function CreateShowModal({ open, onClose, defaultDate, onCreated }) {
  const { user, setlists } = useAuth()
  const { push } = useToast()
  const [name, setName] = useState("")
  const [selectedSetlist, setSelectedSetlist] = useState(null)
  const [saving, setSaving] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    if (open) {
      setName(defaultDate ? `Show - ${new Date(defaultDate).toDateString()}` : "")
      setSelectedSetlist(null)
    }
  }, [open, defaultDate])

  const handleCreate = async () => {
    if (!user) return push("Sign in to create shows", { type: "error" })
    if (!name || !name.trim()) return push("Please enter a show name", { type: "error" })
    setSaving(true)
    try {
      const body = { name: name.trim(), startsAt: defaultDate || null }
      if (selectedSetlist) body.setlistId = selectedSetlist
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": user.uid,
          "x-display-name": user.displayName || "Artist",
        },
        body: JSON.stringify(body),
      })
      const j = await res.json()
      if (!res.ok || !j.success) throw new Error(j.error || "Failed to create show")
      push("Show created", { type: "success" })
      onCreated && onCreated(j.event)
      onClose && onClose()
    } catch (e) {
      console.error(e)
      push(e.message || "Error creating show", { type: "error" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <BaseModal open={open} onClose={onClose} label="Create Show" initialFocusRef={nameRef}>
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-green-600 rounded-t-2xl text-green-50">
        <h3 className="font-bold tracking-wide">Create Show</h3>
        <button onClick={onClose} className="text-green-100 hover:text-white text-sm">Close</button>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Show name</label>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="e.g. Friday Night Set"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Assign setlist (optional)</label>
          <select
            value={selectedSetlist || ""}
            onChange={(e) => setSelectedSetlist(e.target.value || null)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">(No setlist)</option>
            {(setlists || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            {saving ? "Creating..." : "Create Show"}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}
