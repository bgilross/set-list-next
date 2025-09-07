"use client"
import React from "react"

/*
BaseModal: shared modal shell for consistent styling & layering.
Props:
- open: boolean
- onClose: () => void (fires on backdrop click)
- children: modal body (already scrollable region or custom layout)
- maxWidth: tailwind max-w-* class (default max-w-3xl)
- z: number for z-index layering (default 50)
- panelClass: extra classes for panel
- backdropClass: override/extend backdrop styling
*/

export default function BaseModal({
	open,
	onClose,
	children,
	maxWidth = "max-w-3xl",
	z = 50,
	panelClass = "",
	backdropClass = "",
	label,
}) {
	if (!open) return null
	return (
		<div
			className={`fixed inset-0 z-[${z}] flex items-center justify-center p-4`}
		>
			<div
				className={`absolute inset-0 bg-blue-950/60 backdrop-blur-sm ${backdropClass}`}
				onClick={onClose}
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={label}
				className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-blue-200 flex flex-col max-h-[85vh] ${panelClass}`}
			>
				{children}
			</div>
		</div>
	)
}
