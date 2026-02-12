'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowRightIcon } from '@/components/icons'
import { LogoIcon } from '@/components/logo'

export default function OnboardingPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [partner2Name, setPartner2Name] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [venueName, setVenueName] = useState('')
  const [budget, setBudget] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Pre-fill name from user profile
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        const nameParts = user.user_metadata.full_name.split(' ')
        setFirstName(nameParts[0] || '')
        setLastName(nameParts.slice(1).join(' ') || '')
      }
    }
    getUser()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('You must be logged in')
      setIsLoading(false)
      return
    }

    let parsedBudget: number | null = null
    if (budget) {
      const sanitized = budget.replace(/[^0-9.]/g, '')
      const parsed = parseFloat(sanitized)
      if (isNaN(parsed) || parsed <= 0) {
        setError('Please enter a valid budget amount')
        setIsLoading(false)
        return
      }
      parsedBudget = parsed
    }

    const { error } = await supabase
      .from('weddings')
      .insert({
        user_id: user.id,
        partner1_name: `${firstName} ${lastName}`.trim(),
        partner2_name: partner2Name || null,
        wedding_date: weddingDate || null,
        venue_name: venueName || null,
        budget: parsedBudget,
      })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F0E9] to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <LogoIcon size={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Tell us about your wedding</h1>
          <p className="text-gray-600 mt-1">We&apos;ll use this to personalize your experience</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Your Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Partner's Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner&apos;s Name
              </label>
              <input
                type="text"
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
                placeholder="Partner's name (optional)"
              />
            </div>

            {/* Wedding Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wedding Date
              </label>
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Don&apos;t worry, you can change this later</p>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
                placeholder="e.g. The Grand Oak Estate"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
                  placeholder="20,000"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2
                transition-all duration-200
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#87A98F] hover:bg-[#5C7C65]'
                }
              `}
            >
              {isLoading ? 'Creating...' : (
                <>
                  Create My Wedding
                  <ArrowRightIcon size={18} />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
