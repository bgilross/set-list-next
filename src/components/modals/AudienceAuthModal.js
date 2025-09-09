"use client"
import React, { useMemo } from "react"
import BaseModal from "./BaseModal"
import { useAuth } from "@/lib/AuthContext"

export default function AudienceAuthModal({ open, onClose, slug }) {
	const { signInWithGoogle } = useAuth()
	const storageKey = useMemo(
		() => (slug ? `audience_prompt_dismissed::${slug}` : null),
		[slug]
	)

	const dismissForNow = () => {
		try {
			if (storageKey) localStorage.setItem(storageKey, String(Date.now()))
		} catch {}
		onClose?.()
	}

	return (
		<BaseModal
			open={open}
			onClose={dismissForNow}
			maxWidth="max-w-md"
			label="Welcome"
		>
			<div className="p-5 sm:p-6">
				<h2 className="text-xl sm:text-2xl font-bold text-blue-700">
					Welcome!
				</h2>
				<p className="mt-2 text-sm text-gray-600">
					Sign in for faster requests and saved preferences, or continue as a
					guest.
				</p>

				<div className="mt-5 flex flex-col gap-3">
					<button
						onClick={async () => {
							try {
								await signInWithGoogle()
							} finally {
								dismissForNow()
							}
						}}
						className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
					>
						Continue with Google
					</button>
					<button
						onClick={dismissForNow}
						className="w-full py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
					>
						Continue as Guest
					</button>
				</div>

				<p className="mt-3 text-[11px] text-gray-400">
					We only use your profile to personalize your experience. You can sign
					out anytime.
				</p>
			</div>
		</BaseModal>
	)
}
