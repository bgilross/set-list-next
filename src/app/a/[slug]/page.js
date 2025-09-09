"use client"
import { useEffect, useMemo, useState } from "react"
import PublicAudienceView from "@/components/PublicAudienceView"
import AudienceAuthModal from "@/components/modals/AudienceAuthModal"
import { useAuth } from "@/lib/AuthContext"

export default function AudiencePage({ params }) {
	const { slug } = params
	const { user } = useAuth()
	const storageKey = useMemo(
		() => (slug ? `audience_prompt_dismissed::${slug}` : null),
		[slug]
	)
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (!slug) return
		if (typeof window === "undefined") return
		if (user) return // don’t prompt signed-in users
		try {
			const seen = storageKey ? localStorage.getItem(storageKey) : null
			if (!seen) setOpen(true)
		} catch {
			setOpen(true)
		}
	}, [slug, user, storageKey])

	return (
		<>
			<PublicAudienceView slug={slug} />
			<AudienceAuthModal
				open={open}
				onClose={() => setOpen(false)}
				slug={slug}
			/>
		</>
	)
}
