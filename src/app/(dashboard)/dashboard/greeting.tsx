'use client'

import { useState, useEffect } from 'react'
import { SunIcon } from '@/components/icons'

interface GreetingProps {
  name: string
}

export function Greeting({ name }: GreetingProps) {
  const [timeOfDay, setTimeOfDay] = useState<string>('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setTimeOfDay('morning')
    } else if (hour < 17) {
      setTimeOfDay('afternoon')
    } else {
      setTimeOfDay('evening')
    }
  }, [])

  // Don't render until we know the time (prevents hydration mismatch)
  if (!timeOfDay) {
    return (
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        Welcome, {name}!
        <SunIcon className="text-[#C9A962]" size={24} />
      </h2>
    )
  }

  return (
    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
      Good {timeOfDay}, {name}!
      <SunIcon className="text-[#C9A962]" size={24} />
    </h2>
  )
}
