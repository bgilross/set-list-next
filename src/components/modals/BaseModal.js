"use client"
import React, { useEffect, useRef, useCallback } from "react"

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
	lockBodyScroll = true,
	initialFocusRef,
}) {
	const panelRef = useRef(null)
	const lastFocused = useRef(null)

	// Capture last focused element to restore after close
	useEffect(() => {
		if (open) {
			lastFocused.current = document.activeElement
		}
	}, [open])

	// Body scroll lock
	useEffect(() => {
		if (!open || !lockBodyScroll) return
		const original = document.body.style.overflow
		document.body.style.overflow = "hidden"
		return () => {
			document.body.style.overflow = original
		}
	}, [open, lockBodyScroll])

	// Focus trap & initial focus
	useEffect(() => {
		if (!open) return
		const panel = panelRef.current
		if (!panel) return
		// Focus first focusable or provided ref
		const focusTarget =
			initialFocusRef?.current ||
			panel.querySelector(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
		if (focusTarget) focusTarget.focus()

		const handleKey = (e) => {
			if (e.key === "Escape") {
				e.stopPropagation()
				onClose?.()
			} else if (e.key === "Tab") {
				const focusable = Array.from(
					panel.querySelectorAll(
						'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
					)
				).filter(
					(el) =>
						!el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
				)
				if (!focusable.length) {
					e.preventDefault()
					return
				}
				const first = focusable[0]
				const last = focusable[focusable.length - 1]
				if (e.shiftKey) {
					if (document.activeElement === first) {
						e.preventDefault()
						last.focus()
					}
				} else {
					if (document.activeElement === last) {
						e.preventDefault()
						first.focus()
					}
				}
			}
		}
		document.addEventListener("keydown", handleKey, true)
		return () => document.removeEventListener("keydown", handleKey, true)
	}, [open, onClose, initialFocusRef])

	// Restore focus when closed
	useEffect(() => {
		if (!open && lastFocused.current) {
			try {
				lastFocused.current.focus()
			} catch (_) {}
		}
	}, [open])

	const onBackdropClick = useCallback(
		(e) => {
			if (e.target === e.currentTarget) onClose?.()
		},
		[onClose]
	)

	if (!open) return null
	return (
		<div
			className={`fixed inset-0 z-[${z}] flex items-center justify-center p-4`}
			onMouseDown={onBackdropClick}
			role="presentation"
		>
			<div
				className={`absolute inset-0 bg-blue-950/60 backdrop-blur-sm ${backdropClass}`}
			/>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-label={label}
				className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-blue-200 flex flex-col max-h-[85vh] outline-none ${panelClass}`}
			>
				{children}
			</div>
		</div>
	)
}
