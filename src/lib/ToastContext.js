"use client"
import { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext(null)
export function useToast() {
	return useContext(ToastContext)
}

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([])
	const push = useCallback((msg, opts = {}) => {
		const id = Date.now() + Math.random()
		setToasts((t) => [
			...t,
			{ id, msg, type: opts.type || "info", ttl: opts.ttl || 4000 },
		])
		setTimeout(
			() => setToasts((t) => t.filter((x) => x.id !== id)),
			opts.ttl || 4000
		)
	}, [])
	return (
		<ToastContext.Provider value={{ push }}>
			{children}
			<div className="fixed top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[60] w-full px-4 pointer-events-none">
				{toasts.map((t) => (
					<div
						key={t.id}
						className={`pointer-events-auto px-4 py-2 rounded-lg shadow text-sm font-medium text-blue-950 animate-fade-in-down bg-gradient-to-r ${
							t.type === "error"
								? "from-red-400 to-red-500"
								: t.type === "success"
								? "from-green-400 to-blue-400"
								: "from-blue-400 to-green-400"
						}`}
					>
						{t.msg}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	)
}
