'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogoIcon } from '@/components/logo'
import { Footer } from '@/components/footer'
import { CheckIcon, ArrowLeftIcon } from '@/components/icons'

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleUpgrade = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      })

      if (!response.ok) {
        setError('Unable to start checkout. Please try again.')
        setIsLoading(false)
        return
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
        setError('Unable to start checkout. Please try again.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Unable to start checkout. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F0E9] to-white flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon size={16} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LogoIcon size={60} />
            </div>
            <h1 className="text-3xl font-bold text-[#2C3E2D] mb-2">
              Unlock Unlimited Vendors
            </h1>
            <p className="text-gray-600">
              You&apos;ve reached the free limit of 3 vendors. Upgrade to add as many as you need!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-[#2C3E2D]">
                $29.99
              </div>
              <p className="text-gray-500 text-sm">One-time payment • Lifetime access</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E8F0E9] flex items-center justify-center">
                  <CheckIcon size={12} className="text-[#5C7C65]" />
                </div>
                <span className="text-gray-700">Unlimited vendors</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E8F0E9] flex items-center justify-center">
                  <CheckIcon size={12} className="text-[#5C7C65]" />
                </div>
                <span className="text-gray-700">Unlimited request links</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E8F0E9] flex items-center justify-center">
                  <CheckIcon size={12} className="text-[#5C7C65]" />
                </div>
                <span className="text-gray-700">All current features</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E8F0E9] flex items-center justify-center">
                  <CheckIcon size={12} className="text-[#5C7C65]" />
                </div>
                <span className="text-gray-700">Future updates included</span>
              </li>
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className={`
                w-full py-4 rounded-xl font-semibold text-lg text-white
                transition-all duration-200
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#87A98F] hover:bg-[#5C7C65] shadow-lg shadow-[#87A98F]/30'
                }
              `}
            >
              {isLoading ? 'Redirecting to checkout...' : 'Upgrade Now'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mt-4">
                {error}
              </div>
            )}

            <p className="text-center text-gray-400 text-xs mt-4">
              Secure payment powered by Stripe
            </p>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Questions? <a href="mailto:feedback@weddingvendorhq.com" className="text-[#5C7C65] hover:text-[#87A98F]">Contact us</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
