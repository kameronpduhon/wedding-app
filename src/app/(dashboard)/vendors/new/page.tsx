'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'photographer', label: 'Photographer', emoji: '📸' },
  { value: 'videographer', label: 'Videographer', emoji: '🎥' },
  { value: 'caterer', label: 'Caterer', emoji: '🍽️' },
  { value: 'florist', label: 'Florist', emoji: '💐' },
  { value: 'dj', label: 'DJ', emoji: '🎵' },
  { value: 'band', label: 'Band', emoji: '🎸' },
  { value: 'cake', label: 'Cake/Bakery', emoji: '🎂' },
  { value: 'venue', label: 'Venue', emoji: '📍' },
  { value: 'planner', label: 'Wedding Planner', emoji: '📋' },
  { value: 'officiant', label: 'Officiant', emoji: '💒' },
  { value: 'hair_makeup', label: 'Hair & Makeup', emoji: '💄' },
  { value: 'dress', label: 'Dress/Attire', emoji: '👗' },
  { value: 'suit', label: 'Suit/Tux', emoji: '🤵' },
  { value: 'transportation', label: 'Transportation', emoji: '🚗' },
  { value: 'rentals', label: 'Rentals', emoji: '🪑' },
  { value: 'invitations', label: 'Invitations', emoji: '💌' },
  { value: 'other', label: 'Other', emoji: '✨' },
]

export default function NewVendorPage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('photographer')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [weddingId, setWeddingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Get wedding ID on mount
  useEffect(() => {
    const getWedding = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: wedding } = await supabase
        .from('weddings')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (wedding) {
        setWeddingId(wedding.id)
      }
    }
    getWedding()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!weddingId) {
      setError('No wedding found. Please complete onboarding first.')
      setIsLoading(false)
      return
    }

    const { error } = await supabase
      .from('vendors')
      .insert({
        wedding_id: weddingId,
        name,
        category,
        contact_name: contactName || null,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="font-semibold text-gray-900">Add Vendor</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Vendor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor/Business Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                placeholder="e.g. Sweet Tooth Bakery"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                placeholder="e.g. Amy Johnson"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                  placeholder="vendor@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                placeholder="Any notes about this vendor..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-medium text-white
                  transition-all duration-200
                  ${isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-pink-500 hover:bg-pink-600'
                  }
                `}
              >
                {isLoading ? 'Adding...' : 'Add Vendor'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
