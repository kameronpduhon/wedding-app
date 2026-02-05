'use client'

import { useState } from 'react'

export function CopyButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/respond/${token}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="px-2 py-1 text-xs text-pink-600 hover:bg-pink-50 rounded transition-colors"
    >
      {copied ? '✓ Copied!' : 'Copy'}
    </button>
  )
}
