import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from './logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user's wedding
  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // If no wedding, redirect to onboarding
  if (!wedding) {
    redirect('/onboarding')
  }

  // Get vendors with their requests
  const { data: vendors } = await supabase
    .from('vendors')
    .select(`
      *,
      requests (
        id,
        token,
        status,
        created_at,
        responses (
          id,
          vendor_note,
          created_at,
          files (*)
        )
      )
    `)
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  // Calculate stats
  const totalVendors = vendors?.length || 0
  const pendingRequests = vendors?.reduce((acc, v) => 
    acc + (v.requests?.filter((r: { status: string }) => r.status === 'pending').length || 0), 0) || 0
  const completedResponses = vendors?.reduce((acc, v) => 
    acc + (v.requests?.filter((r: { status: string }) => r.status === 'completed').length || 0), 0) || 0

  // Days until wedding
  const daysUntil = wedding.wedding_date 
    ? Math.ceil((new Date(wedding.wedding_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💒</span>
            <div>
              <h1 className="font-semibold text-gray-900">
                {wedding.partner1_name}
                {wedding.partner2_name ? ` & ${wedding.partner2_name}` : ''}&apos;s Wedding
              </h1>
              {wedding.wedding_date && (
                <p className="text-sm text-gray-500">
                  {new Date(wedding.wedding_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome + Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Good {getTimeOfDay()}, {wedding.partner1_name}! ☀️
              </h2>
              {daysUntil && daysUntil > 0 && (
                <p className="text-gray-600">{daysUntil} days until the big day</p>
              )}
            </div>
            <Link
              href="/vendors/new"
              className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
            >
              + Add Vendor
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-3xl font-bold text-pink-500">{totalVendors}</p>
              <p className="text-sm text-gray-600">Total Vendors</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-3xl font-bold text-yellow-500">{pendingRequests}</p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-3xl font-bold text-green-500">{completedResponses}</p>
              <p className="text-sm text-gray-600">Responses Received</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-3xl font-bold text-gray-900">
                {wedding.budget ? `$${wedding.budget.toLocaleString()}` : '—'}
              </p>
              <p className="text-sm text-gray-600">Budget</p>
            </div>
          </div>
        </div>

        {/* Vendors List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">My Vendors ({totalVendors})</h3>
          </div>

          {vendors && vendors.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {vendors.map((vendor) => {
                const latestRequest = vendor.requests?.[0]
                const status = latestRequest?.status || 'none'
                
                return (
                  <div key={vendor.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-lg">
                        {getCategoryEmoji(vendor.category)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{vendor.name}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {vendor.category.replace('_', ' ')}
                          {vendor.contact_name && ` • ${vendor.contact_name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={status} />
                      <Link
                        href={`/vendors/${vendor.id}`}
                        className="px-3 py-1.5 text-sm text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-gray-600 mb-4">No vendors yet. Add your first vendor to get started!</p>
              <Link
                href="/vendors/new"
                className="inline-block px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
              >
                + Add Vendor
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function getCategoryEmoji(category: string) {
  const emojis: Record<string, string> = {
    photographer: '📸',
    videographer: '🎥',
    caterer: '🍽️',
    florist: '💐',
    dj: '🎵',
    band: '🎸',
    cake: '🎂',
    venue: '📍',
    planner: '📋',
    officiant: '💒',
    hair_makeup: '💄',
    dress: '👗',
    suit: '🤵',
    transportation: '🚗',
    rentals: '🪑',
    invitations: '💌',
    other: '✨',
  }
  return emojis[category] || '✨'
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    none: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-700',
    viewed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  }
  
  const labels: Record<string, string> = {
    none: 'No request',
    pending: 'Pending',
    viewed: 'Viewed',
    completed: 'Received',
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.none}`}>
      {labels[status] || 'No request'}
    </span>
  )
}
