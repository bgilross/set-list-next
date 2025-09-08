"use client"
import { useState, useRef, useEffect } from "react"

export default function TagInput({
	value = [],
	onChange,
	placeholder = "add tag",
	size = "sm",
	suggestions = [],
	inputRef,
}) {
	const [input, setInput] = useState("")
	const localRef = useRef(null)
	const mergedRef = (el) => {
		localRef.current = el
		if (typeof inputRef === "function") inputRef(el)
		else if (inputRef) inputRef.current = el
	}
	const base =
		"px-2 py-0.5 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-blue-900 text-[10px] font-semibold shadow"
	const filtered = suggestions
		.filter(
			(s) =>
				s.toLowerCase().includes(input.toLowerCase()) &&
				!value.map((v) => v.toLowerCase()).includes(s.toLowerCase())
		)
		.slice(0, 6)
	function add(tag) {
		const t = tag.trim()
		if (!t) return
		if (value.map((v) => v.toLowerCase()).includes(t.toLowerCase())) return
		onChange([...value, t])
		setInput("")
		// Re-focus after update (next paint)
		requestAnimationFrame(() => {
			localRef.current && localRef.current.focus()
		})
	}
	function handleKey(e) {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault()
			e.stopPropagation()
			add(input)
		} else if (e.key === "Backspace" && !input && value.length) {
			onChange(value.slice(0, -1))
		}
	}
	return (
		<div className="flex flex-wrap gap-1 items-center relative">
			{value.map((tag) => (
				<span
					key={tag}
					className={base}
				>
					{tag}
					<button
						type="button"
						onClick={() => onChange(value.filter((t) => t !== tag))}
						className="ml-1 hover:text-red-700"
					>
						×
					</button>
				</span>
			))}
			<input
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={handleKey}
				placeholder={placeholder}
				ref={mergedRef}
				className="px-2 py-0.5 text-[10px] rounded bg-blue-900/40 border border-blue-400/40 focus:border-green-300/70 outline-none text-green-50 w-24"
			/>
			{input && filtered.length > 0 && (
				<div className="absolute top-full left-0 mt-1 z-20 bg-blue-900/90 border border-blue-400/40 rounded-lg shadow-lg min-w-[8rem] p-1 flex flex-col gap-0.5">
					{filtered.map((s) => (
						<button
							type="button"
							key={s}
							className="text-left text-[10px] px-2 py-1 rounded hover:bg-blue-700/60 text-green-50"
							onClick={() => {
								add(s)
							}}
						>
							{s}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
