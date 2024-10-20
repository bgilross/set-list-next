import classNames from 'classnames'
import { useState } from 'react'

const ScrollableText = ({ text, className }) => {
  const shouldScroll = text?.length > 15 // Check if the text needs scrolling
  const [isHovered, setIsHovered] = useState(false) // Track hover state

  const truncatedText = shouldScroll ? `${text.slice(0, 23)}...` : text // Truncate text manually

  const classes = classNames(
    className,
    'relative group w-48 overflow-hidden p-2 box-border'
  )

  return (
    <div
      className={classes}
      style={{ boxSizing: 'border-box' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex items-center space-x-4 ${
          isHovered ? 'animate-marquee' : ''
        }`}
        style={{
          width: isHovered ? 'fit-content' : '100%',
        }}
      >
        {/* Show truncated text by default, full text on hover */}
        <p className="whitespace-nowrap">{isHovered ? text : truncatedText}</p>
      </div>
    </div>
  )
}

export default ScrollableText
