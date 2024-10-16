'use client'

import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

const WordWrapper = styled.div`
  pointer-events: none;
  display: flex;
  cursor: default;
  overflow: hidden;
  width: 100%;
`

const Letter = styled.span`
  cursor: default;
  transition: transform 0.3s ease-in-out, letter-spacing 0.3s ease-in-out;
  transform-origin: 50% 50%;
  letter-spacing: 0;
  transform: translateX(0);
  user-select: none;
  caret-color: transparent;

  &.hovered {
    letter-spacing: ${(props) => props.spreadAmount}px;
    transform: translateX(${(props) => props.spreadAmount * props.index}px);
    animation: wiggle 0.5s ease-in-out infinite;
  }
`

const SpreadWord = ({ word, spreadWord }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    // Calculate the width of the parent container when the component mounts
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    // Update the width on window resize
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  // Calculate spread amount based on the container's width and number of letters
  const spreadAmount = containerWidth / word.length / 2.5

  return (
    <WordWrapper
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {word.split('').map((letter, index) => (
        <Letter
          key={index}
          className={spreadWord ? 'hovered' : ''}
          spreadAmount={spreadAmount}
          index={index}
        >
          {letter}
        </Letter>
      ))}
    </WordWrapper>
  )
}

export default SpreadWord
