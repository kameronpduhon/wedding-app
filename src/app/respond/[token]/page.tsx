import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { VendorResponseForm } from './vendor-response-form'
import { LogoIcon } from '@/components/logo'

// Use service role for public vendor page (bypasses RLS)
// This is safe because we're only exposing data tied to a valid token
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function VendorResponsePage({ params }: PageProps) {
  const { token } = await params

  // Fetch request with vendor and wedding info using admin client
  const { data: request, error } = await supabaseAdmin
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

  // Mark as viewed if first time
  if (request.status === 'pending') {
    await supabaseAdmin
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
