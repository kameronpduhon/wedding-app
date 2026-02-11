import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { SendRequestButton } from './send-request-button'
import { RequestCard } from './request-card'
import { DeleteVendorButton } from './delete-vendor-button'
import { ArrowLeftIcon, MailIcon, PencilIcon, getCategoryLabel } from '@/components/icons'
import { DocumentUpload } from './document-upload'
import { DocumentList } from './document-list'
import { Footer } from '@/components/footer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VendorDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get vendor with wedding info and requests/responses
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select(`
      *,
      wedding:weddings!inner (
        id,
        user_id,
        partner1_name
      ),
      requests (
        id,
        token,
        status,
        request_invoice,
        request_contract,
        request_availability,
        request_package_details,
        request_contact_update,
        personal_note,
        created_at,
        viewed_at,
        completed_at,
        responses (
          id,
          vendor_note,
          created_at,
          files (
            id,
            file_type,
            file_name,
            file_path,
            file_size
          )
        )
      )
    `)
    .eq('id', id)
    .order('created_at', { referencedTable: 'requests', ascending: false })
    .single()

  if (error || !vendor) {
    notFound()
  }

  // Verify ownership
  if (vendor.wedding.user_id !== user.id) {
    notFound()
  }

  const latestRequest = vendor.requests?.[0]
  const hasActiveRequest = latestRequest && latestRequest.status !== 'completed'

  // Get vendor documents
  const { data: documents } = await supabase
    .from('vendor_documents')
    .select('*')
    .eq('vendor_id', id)
    .order('uploaded_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#FDFDFB] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
              <ArrowLeftIcon size={16} />
              Back
            </Link>
            <div>
              <h1 className="font-semibold text-gray-900">{vendor.name}</h1>
              <p className="text-sm text-gray-500">{getCategoryLabel(vendor.category)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/vendors/${vendor.id}/edit`}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <PencilIcon size={16} />
              Edit
            </Link>
            <DeleteVendorButton 
              vendorId={vendor.id} 
              vendorName={vendor.name}
            />
            <SendRequestButton 
              vendorId={vendor.id} 
              vendorName={vendor.name}
              vendorContactName={vendor.contact_name}
              vendorEmail={vendor.email}
              brideName={vendor.wedding.partner1_name}
              hasActiveRequest={hasActiveRequest}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6 flex-1">
        {/* Vendor Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[280px]">
          <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendor.contact_name && (
              <div>
                <p className="text-sm text-gray-500">Contact Person</p>
                <p className="text-gray-900">{vendor.contact_name}</p>
              </div>
            )}
            {vendor.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${vendor.email}`} className="text-[#5C7C65] hover:text-[#87A98F]">
                  {vendor.email}
                </a>
              </div>
            )}
            {vendor.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a href={`tel:${vendor.phone}`} className="text-[#5C7C65] hover:text-[#87A98F]">
                  {vendor.phone}
                </a>
              </div>
            )}
            {vendor.total_cost && (
              <div>
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-gray-900">${vendor.total_cost.toLocaleString()}</p>
              </div>
            )}
          </div>
          {vendor.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Notes</p>
              <p className="text-gray-700">{vendor.notes}</p>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[280px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Documents</h2>
            <DocumentUpload vendorId={vendor.id} />
          </div>
          <DocumentList documents={documents || []} vendorId={vendor.id} />
        </div>

        {/* Requests & Responses */}
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[280px]">
          <h2 className="font-semibold text-gray-900 mb-4">Requests & Responses</h2>
          
          {vendor.requests && vendor.requests.length > 0 ? (
            <div className="space-y-4">
              {vendor.requests.map((request: {
                id: string
                token: string
                status: string
                request_invoice: boolean
                request_contract: boolean
                request_availability: boolean
                request_package_details: boolean
                request_contact_update: boolean
                personal_note: string | null
                created_at: string
                viewed_at: string | null
                completed_at: string | null
                responses: Array<{
                  id: string
                  vendor_note: string | null
                  created_at: string
                  files: Array<{
                    id: string
                    file_type: string
                    file_name: string
                    file_path: string
                    file_size: number | null
                  }>
                }>
              }) => (
                <RequestCard 
                  key={request.id} 
                  request={request}
                  partnerName={vendor.wedding.partner1_name}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#5C7C65] mx-auto mb-4">
                <MailIcon size={28} />
              </div>
              <p className="text-gray-600 mb-4">No requests sent yet</p>
              <SendRequestButton 
                vendorId={vendor.id} 
                vendorName={vendor.name}
                vendorContactName={vendor.contact_name}
                vendorEmail={vendor.email}
                brideName={vendor.wedding.partner1_name}
                hasActiveRequest={false}
                variant="primary"
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
