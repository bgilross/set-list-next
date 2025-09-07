import classNames from "classnames"
import { useEffect, useRef, useState } from "react"

/*
	ScrollableText improvements:
	- Measures content vs container; if overflow, enables hover marquee.
	- If no overflow, shows full text (no truncation or animation).
	- Optional maxWidth can be passed via className (Tailwind) or wrapper style.
	- Accessible: sets title attr when truncated so full text appears on hover tooltip.
*/

// hoverSpeed now represents pixels per second movement (higher = faster)
// direction: 'left' | 'right'
const ScrollableText = ({
	text = "",
	className = "",
	hoverSpeed = 120,
	direction = "left",
	pauseStartPct = 8,
	pauseEndPct = 8,
}) => {
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

	// Animation style: translate across its width then reset.
	const animationDuration = (() => {
		if (!contentRef.current || !containerRef.current) return "4s"
		const extra =
			contentRef.current.scrollWidth - containerRef.current.clientWidth
		if (extra <= 0) return "0s"
		const pxPerSec = Math.max(20, hoverSpeed)
		const seconds = Math.max(2, extra / pxPerSec)
		return `${seconds}s`
	})()

	const containerWidth = containerRef.current?.clientWidth || 0

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
								animation: `sl-marquee-${direction}-${containerWidth} ${animationDuration} linear 0s 1`,
						  }
						: undefined
				}
				onAnimationEnd={() => setHover(false)}
			>
				{text}
			</div>
			<style jsx>{`
				@keyframes sl-marquee-left-${containerWidth} {
					0% {
						transform: translateX(0);
					}
					${pauseStartPct}% {
						transform: translateX(0);
					}
					${100 - pauseEndPct}% {
						transform: translateX(calc(-1 * (100% - ${containerWidth}px)));
					}
					100% {
						transform: translateX(calc(-1 * (100% - ${containerWidth}px)));
					}
				}
				@keyframes sl-marquee-right-${containerWidth} {
					0% {
						transform: translateX(calc(-1 * (100% - ${containerWidth}px)));
					}
					${pauseStartPct}% {
						transform: translateX(calc(-1 * (100% - ${containerWidth}px)));
					}
					${100 - pauseEndPct}% {
						transform: translateX(0);
					}
					100% {
						transform: translateX(0);
					}
				}
			`}</style>
		</div>
	)
}

export default ScrollableText
