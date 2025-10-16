'use client'

import { useEffect, useState } from 'react'

export default function TypingAnimation() {
  const [displayText, setDisplayText] = useState('')
  const [currentPhase, setCurrentPhase] = useState<'typing-everywhere' | 'deleting' | 'typing-anywhere' | 'pause'>('typing-everywhere')
  const [charIndex, setCharIndex] = useState(0)

  const baseText = 'Post '
  const word1 = 'Everywhere'
  const word2 = 'Anywhere'

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (currentPhase === 'typing-everywhere') {
      if (charIndex < word1.length) {
        timeout = setTimeout(() => {
          setDisplayText(baseText + word1.slice(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        }, 150)
      } else {
        timeout = setTimeout(() => {
          setCurrentPhase('pause')
        }, 2000) // Pause for 2 seconds before deleting
      }
    } else if (currentPhase === 'pause') {
      timeout = setTimeout(() => {
        setCurrentPhase('deleting')
      }, 1000)
    } else if (currentPhase === 'deleting') {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayText(baseText + word1.slice(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        }, 100)
      } else {
        timeout = setTimeout(() => {
          setCurrentPhase('typing-anywhere')
          setCharIndex(0)
        }, 200)
      }
    } else if (currentPhase === 'typing-anywhere') {
      if (charIndex < word2.length) {
        timeout = setTimeout(() => {
          setDisplayText(baseText + word2.slice(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        }, 150)
      } else {
        timeout = setTimeout(() => {
          setCurrentPhase('typing-everywhere')
          setCharIndex(0)
        }, 3000) // Pause for 3 seconds before restarting
      }
    }

    return () => clearTimeout(timeout)
  }, [charIndex, currentPhase])

  return (
    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
      {displayText}
      <span className="animate-pulse">|</span>
    </h1>
  )
}
