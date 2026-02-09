'use client'

import { SunIcon } from '@/components/icons'

interface GreetingProps {
  name: string
}

export function Greeting({ name }: GreetingProps) {
  return (
    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
      Welcome back, {name}!
      <SunIcon className="text-[#C9A962]" size={24} />
    </h2>
  )
}
