'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  CameraIcon, 
  VideoIcon, 
  UtensilsIcon, 
  FlowerIcon, 
  MusicIcon, 
  GuitarIcon,
  CakeIcon,
  MapPinIcon,
  ClipboardIcon,
  HeartIcon,
  ScissorsIcon,
  ShirtIcon,
  CarIcon,
  ArmchairIcon,
  MailIcon,
  SparklesIcon
} from '@/components/icons'

const CATEGORIES = [
  { value: 'photographer', label: 'Photographer', icon: CameraIcon },
  { value: 'videographer', label: 'Videographer', icon: VideoIcon },
  { value: 'caterer', label: 'Caterer', icon: UtensilsIcon },
  { value: 'florist', label: 'Florist', icon: FlowerIcon },
  { value: 'dj', label: 'DJ', icon: MusicIcon },
  { value: 'band', label: 'Band', icon: GuitarIcon },
  { value: 'cake', label: 'Cake/Bakery', icon: CakeIcon },
  { value: 'venue', label: 'Venue', icon: MapPinIcon },
  { value: 'planner', label: 'Wedding Planner', icon: ClipboardIcon },
  { value: 'officiant', label: 'Officiant', icon: HeartIcon },
  { value: 'hair_stylist', label: 'Hair Stylist', icon: ScissorsIcon },
  { value: 'makeup_artist', label: 'Makeup Artist', icon: SparklesIcon },
  { value: 'hair_makeup', label: 'Hair & Makeup', icon: ScissorsIcon },
  { value: 'dress', label: 'Dress/Attire', icon: ShirtIcon },
  { value: 'suit', label: 'Suit/Tux', icon: ShirtIcon },
  { value: 'transportation', label: 'Transportation', icon: CarIcon },
  { value: 'rentals', label: 'Rentals', icon: ArmchairIcon },
  { value: 'invitations', label: 'Invitations', icon: MailIcon },
  { value: 'other', label: 'Other', icon: SparklesIcon },
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

  const selectedCategory = CATEGORIES.find(c => c.value === category)
  const IconComponent = selectedCategory?.icon || SparklesIcon

  return (
    <div className="min-h-screen bg-[#FDFDFB]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon size={16} />
            Back
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
                placeholder="e.g. Sweet Tooth Bakery"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7C65]">
                  <IconComponent size={18} />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors appearance-none bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
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
                    : 'bg-[#87A98F] hover:bg-[#5C7C65]'
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
