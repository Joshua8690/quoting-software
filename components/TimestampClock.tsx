"use client"

import { useState, useEffect } from "react"

export function TimestampClock() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return <div className="text-sm text-gray-500">{currentTime.toLocaleTimeString()}</div>
}
