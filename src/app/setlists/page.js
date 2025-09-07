"use client"
import { useAuth } from "@/lib/AuthContext"
import SetlistDisplay from "@/components/SetlistDisplay"

export default function SetlistsPage() {
	const { user, setlists } = useAuth()

	if (!user)
		return <div className="p-6">Please sign in to view your setlists.</div>

	return (
		<div className="p-4 flex flex-col items-center">
			<h1 className="text-3xl font-bold text-blue-700 mb-4">Your Setlists</h1>
			<SetlistDisplay
				userId={user.uid}
				setlists={setlists}
				setSongList={() => {}}
			/>
		</div>
	)
}
