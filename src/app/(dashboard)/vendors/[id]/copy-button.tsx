'use client'

import { useState } from 'react'

export function CopyButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/respond/${token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setCopyError(false)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError(true)
      setTimeout(() => setCopyError(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`px-2 py-1 text-xs rounded transition-colors ${copyError ? 'text-red-600 hover:bg-red-50' : 'text-pink-600 hover:bg-pink-50'}`}
    >
      {copyError ? 'Failed to copy' : copied ? '✓ Copied!' : 'Copy'}
    </button>
  )
}
