import { notFound } from 'next/navigation'
import { getServiceRoleClient } from '@/lib/supabase/service'
import { VendorResponseForm } from './vendor-response-form'
import { LogoIcon } from '@/components/logo'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function VendorResponsePage({ params }: PageProps) {
  const { token } = await params

  // Fetch request with vendor and wedding info using admin client
  const { data: request, error } = await getServiceRoleClient()
    .from('requests')
    .select(`
      *,
      vendor:vendors (
        *,
        wedding:weddings (*)
      )
    `)
    .eq('token', token)
    .single()

  if (error || !request || !request.vendor) {
    console.error('Request fetch error:', error)
    notFound()
  }

  const vendor = request.vendor
  const wedding = vendor.wedding

  if (!wedding) {
    console.error('Wedding not found for vendor')
    notFound()
  }

  // Check if token is expired (14 days)
  const TOKEN_EXPIRY_DAYS = 14
  const createdAt = new Date(request.created_at)
  const now = new Date()
  const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  const isExpired = daysSinceCreation > TOKEN_EXPIRY_DAYS && request.status !== 'completed'

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E8F0E9] to-white">
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LogoIcon size={64} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Link Expired</h1>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600 mb-4">
              This request link has expired. Please contact {wedding.partner1_name} to send a new request.
            </p>
            <p className="text-gray-400 text-sm">
              Request links are valid for {TOKEN_EXPIRY_DAYS} days.
            </p>
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            Powered by Wedding Vendor HQ
          </p>
        </div>
      </div>
    )
  }

  // Mark as viewed if first time
  if (request.status === 'pending') {
    await getServiceRoleClient()
      .from('requests')
      .update({ 
        status: 'viewed', 
        viewed_at: new Date().toISOString() 
      })
      .eq('id', request.id)
  }

  // Format wedding date - parse as local date (not UTC)
  const weddingDate = wedding.wedding_date 
    ? (() => {
        const [year, month, day] = wedding.wedding_date.split('-').map(Number)
        return new Date(year, month - 1, day).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      })()
    : null

  // Build list of requested items
  const requestedItems: string[] = []
  if (request.request_invoice) requestedItems.push('Invoice or Quote')
  if (request.request_contract) requestedItems.push('Contract')
  if (request.request_availability) requestedItems.push('Availability / Dates')
  if (request.request_package_details) requestedItems.push('Package Details')
  if (request.request_contact_update) requestedItems.push('Contact Info Update')

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F0E9] to-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoIcon size={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {wedding.partner1_name}
            {wedding.partner2_name ? ` & ${wedding.partner2_name}` : ''}&apos;s Wedding
          </h1>
          {weddingDate && (
            <p className="text-gray-600 mt-1">{weddingDate}</p>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Hi {vendor.name}!
            </h2>
            <p className="text-gray-600 mt-1">
              {wedding.partner1_name} requested the following:
            </p>
          </div>

          {/* Requested Items */}
          <div className="mb-6">
            <ul className="space-y-2">
              {requestedItems.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-[#E8F0E9] text-[#5C7C65] flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Personal Note */}
          {request.personal_note && (
            <div className="mb-6 bg-[#F5E6E0] rounded-lg p-4">
              <p className="text-sm text-[#96792A] mb-1">Note from {wedding.partner1_name}:</p>
              <p className="text-gray-700 italic">&quot;{request.personal_note}&quot;</p>
            </div>
          )}

          {/* Status Badge */}
          {request.status === 'completed' ? (
            <div className="mb-6 bg-[#E8F0E9] border border-[#87A98F] rounded-lg p-4 text-center">
              <p className="text-[#5C7C65] font-medium">You&apos;ve already submitted a response</p>
              <p className="text-[#5C7C65] text-sm mt-1">Thank you!</p>
            </div>
          ) : (
            <VendorResponseForm 
              requestId={request.id}
              token={token}
              requestInvoice={request.request_invoice}
              requestContract={request.request_contract}
            />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Powered by Wedding Vendor HQ
        </p>
      </div>
    </div>
  )
}
