import classNames from "classnames"
import { useEffect, useRef, useState } from "react"

/*
	ScrollableText improvements:
	- Measures content vs container; if overflow, enables hover marquee.
	- If no overflow, shows full text (no truncation or animation).
	- Optional maxWidth can be passed via className (Tailwind) or wrapper style.
	- Accessible: sets title attr when truncated so full text appears on hover tooltip.
*/

const ScrollableText = ({ text = "", className = "", hoverSpeed = 35 }) => {
	const containerRef = useRef(null)
	const contentRef = useRef(null)
	const [overflowing, setOverflowing] = useState(false)
	const [hover, setHover] = useState(false)

	useEffect(() => {
		function measure() {
			if (!containerRef.current || !contentRef.current) return
			const cW = containerRef.current.clientWidth
			const sW = contentRef.current.scrollWidth
			setOverflowing(sW > cW + 2) // buffer
		}
		measure()
		const ro = new ResizeObserver(measure)
		if (containerRef.current) ro.observe(containerRef.current)
		return () => ro.disconnect()
	}, [text])

	const base = classNames(
		"relative select-none",
		"px-2 py-1",
		"transition-colors duration-200",
		"text-[11px] md:text-xs",
		"overflow-hidden",
		className
	)

	// Animation style: translate left across its width then reset.
	const animationDuration = (() => {
		if (!contentRef.current || !containerRef.current) return "8s"
		const extra =
			contentRef.current.scrollWidth - containerRef.current.clientWidth
		const pxPerSec = hoverSpeed // lower is slower
		const seconds = Math.max(5, extra / pxPerSec)
		return `${seconds}s`
	})()

	return (
		<div
			ref={containerRef}
			className={base}
			onMouseEnter={() => overflowing && setHover(true)}
			onMouseLeave={() => setHover(false)}
			title={overflowing ? text : undefined}
		>
			<div
				ref={contentRef}
				className={classNames(
					"whitespace-nowrap",
					hover && overflowing && "will-change-transform"
				)}
				style={
					hover && overflowing
						? {
								animation: `sl-marquee ${animationDuration} linear 0.4s 1`,
						  }
						: undefined
				}
				onAnimationEnd={() => setHover(false)}
			>
				{text}
			</div>
			<style jsx>{`
				@keyframes sl-marquee {
					0% {
						transform: translateX(0);
					}
					5% {
						transform: translateX(0);
					}
					95% {
						transform: translateX(
							calc(-1 * (100% - ${containerRef.current?.clientWidth || 0}px))
						);
					}
					100% {
						transform: translateX(
							calc(-1 * (100% - ${containerRef.current?.clientWidth || 0}px))
						);
					}
				}
			`}</style>
		</div>
	)
}

export default ScrollableText
