"use client"
import React from "react"
import { useAuth } from "@/lib/AuthContext"
import SetlistDisplay from "@/components/SetlistDisplay"

export default function SetlistsPage() {
	const { user } = useAuth()
	return (
		<div className="w-full flex justify-center py-8">
			<div className="w-full max-w-6xl">
				{user?.uid ? (
					<SetlistDisplay userId={user.uid} setSongList={() => {}} onSelectSetlist={() => {}} onCreate={() => {}} />
				) : (
					<div className="text-center text-gray-600">Please sign in to view set lists.</div>
				)}
			</div>
		</div>
	)
}
