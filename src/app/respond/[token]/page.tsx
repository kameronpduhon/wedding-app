import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VendorResponseForm } from './vendor-response-form'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function VendorResponsePage({ params }: PageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Fetch request with vendor and wedding info
  const { data: request, error } = await supabase
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

  if (error || !request) {
    notFound()
  }

  // Mark as viewed if first time
  if (request.status === 'pending') {
    await supabase
      .from('requests')
      .update({ 
        status: 'viewed', 
        viewed_at: new Date().toISOString() 
      })
      .eq('id', request.id)
  }

  const vendor = request.vendor
  const wedding = vendor.wedding

  // Format wedding date
  const weddingDate = wedding.wedding_date 
    ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null

  // Build list of requested items
  const requestedItems: string[] = []
  if (request.request_invoice) requestedItems.push('Invoice or Quote')
  if (request.request_contract) requestedItems.push('Contract')
  if (request.request_availability) requestedItems.push('Availability / Dates')
  if (request.request_package_details) requestedItems.push('Package Details')
  if (request.request_contact_update) requestedItems.push('Contact Info Update')

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💒</div>
          <h1 className="text-2xl font-bold text-gray-900">
            {wedding.partner1_name}
            {wedding.partner2_name ? ` & ${wedding.partner2_name}` : ''}'s Wedding
          </h1>
          {weddingDate && (
            <p className="text-gray-600 mt-1">{weddingDate}</p>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Hi {vendor.name}! 👋
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
                  <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Personal Note */}
          {request.personal_note && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">💬 Note from {wedding.partner1_name}:</p>
              <p className="text-gray-700 italic">"{request.personal_note}"</p>
            </div>
          )}

          {/* Status Badge */}
          {request.status === 'completed' ? (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium">✅ You've already submitted a response</p>
              <p className="text-green-600 text-sm mt-1">Thank you!</p>
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
          Powered by WeddingHub • No account needed
        </p>
      </div>
    </div>
  )
}
