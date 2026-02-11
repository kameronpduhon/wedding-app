'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogoIcon } from '@/components/logo'
import { Footer } from '@/components/footer'
import { CheckIcon } from '@/components/icons'

export default function UpgradeSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F0E9] to-white flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#5C7C65] flex items-center justify-center">
              <CheckIcon size={40} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#2C3E2D] mb-3">
            You&apos;re All Set! 🎉
          </h1>
          
          <p className="text-gray-600 mb-8">
            Thank you for upgrading! You now have unlimited vendor access for your wedding planning.
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex justify-center mb-4">
              <LogoIcon size={50} />
            </div>
            <p className="text-gray-700 font-medium mb-2">
              Unlimited Vendors Unlocked
            </p>
            <p className="text-gray-500 text-sm">
              Add as many vendors as you need — photographers, caterers, florists, and more!
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-[#87A98F] text-white rounded-xl font-semibold text-lg hover:bg-[#5C7C65] transition-colors shadow-lg shadow-[#87A98F]/30"
          >
            Go to Dashboard
          </Link>

          <p className="text-gray-400 text-sm mt-4">
            Redirecting in {countdown} seconds...
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
