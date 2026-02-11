import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from './logout-button'
import { PlusIcon, UsersIcon, SparklesIcon } from '@/components/icons'
import { SortableVendorList } from './sortable-vendor-list'
import { LogoIcon } from '@/components/logo'
import { Greeting } from './greeting'
import { Footer } from '@/components/footer'
import { FREE_VENDOR_LIMIT } from '@/lib/stripe'

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
    .order('position', { ascending: true })

  // Calculate stats
  const totalVendors = vendors?.length || 0
  const pendingRequests = vendors?.reduce((acc, v) => 
    acc + (v.requests?.filter((r: { status: string }) => r.status === 'pending').length || 0), 0) || 0
  const completedResponses = vendors?.reduce((acc, v) => 
    acc + (v.requests?.filter((r: { status: string }) => r.status === 'completed').length || 0), 0) || 0

  // Premium status
  const isPremium = wedding.is_premium || false
  const isAtLimit = !isPremium && totalVendors >= FREE_VENDOR_LIMIT
  const addVendorHref = isAtLimit ? '/upgrade' : '/vendors/new'

  // Days until wedding - parse as local date (not UTC)
  const daysUntil = wedding.wedding_date 
    ? (() => {
        const [year, month, day] = wedding.wedding_date.split('-').map(Number)
        const weddingDate = new Date(year, month - 1, day) // Local midnight
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Reset to local midnight
        return Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      })()
    : null

  return (
    <div className="min-h-screen bg-[#FDFDFB] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon size={40} />
            <div>
              <h1 className="font-semibold text-gray-900">
                {wedding.partner1_name}
                {wedding.partner2_name ? ` & ${wedding.partner2_name}` : ''}&apos;s Wedding
              </h1>
              {wedding.wedding_date && (
                <p className="text-sm text-gray-500">
                  {(() => {
                    const [year, month, day] = wedding.wedding_date.split('-').map(Number)
                    return new Date(year, month - 1, day).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })
                  })()}
                </p>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        {/* Welcome + Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <Greeting name={wedding.partner1_name} />
              {daysUntil && daysUntil > 0 && (
                <p className="text-gray-600">{daysUntil} days until the big day</p>
              )}
            </div>
            <Link
              href={addVendorHref}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isAtLimit 
                  ? 'bg-[#C9A962] text-white hover:bg-[#B08A52]' 
                  : 'bg-[#87A98F] text-white hover:bg-[#5C7C65]'
              }`}
            >
              {isAtLimit ? (
                <>
                  <SparklesIcon size={18} />
                  Upgrade to Add More
                </>
              ) : (
                <>
                  <PlusIcon size={18} />
                  Add Vendor
                </>
              )}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-3xl font-bold text-[#87A98F]">
                {totalVendors}
                {!isPremium && (
                  <span className="text-lg font-normal text-gray-400">/{FREE_VENDOR_LIMIT}</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                {isPremium ? 'Vendors (Unlimited)' : 'Free Vendors'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-3xl font-bold text-[#C9A962]">{pendingRequests}</p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-3xl font-bold text-[#5C7C65]">{completedResponses}</p>
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
            <SortableVendorList initialVendors={vendors} />
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#5C7C65] mx-auto mb-4">
                <UsersIcon size={28} />
              </div>
              <p className="text-gray-600 mb-4">No vendors yet. Add your first vendor to get started!</p>
              <Link
                href={addVendorHref}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#87A98F] text-white rounded-lg font-medium hover:bg-[#5C7C65] transition-colors"
              >
                <PlusIcon size={18} />
                Add Vendor
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
