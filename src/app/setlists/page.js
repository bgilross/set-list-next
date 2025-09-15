"use client"
import React from "react"
import { useAuth } from "@/lib/AuthContext"
import Main from "@/components/Main"

export default function SetlistsPage() {
	const { user } = useAuth()
	return (
		<div className="w-full flex justify-center py-8">
			<div className="w-full max-w-6xl">
				{user?.uid ? (
					<Main />
				) : (
					<div className="text-center text-gray-600">
						Please sign in to view set lists.
					</div>
				)}
			</div>
		</div>
	)
}
