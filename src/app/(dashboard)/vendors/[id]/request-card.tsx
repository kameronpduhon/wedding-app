'use client'

import { ResponseCard } from './response-card'
import { CopyButton } from './copy-button'

interface RequestCardProps {
  request: {
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
  }
  partnerName: string
}

export function RequestCard({ request, partnerName }: RequestCardProps) {
  const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    viewed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  }
  
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    viewed: 'Viewed',
    completed: 'Completed',
  }

  const requestedItems = []
  if (request.request_invoice) requestedItems.push('Invoice')
  if (request.request_contract) requestedItems.push('Contract')
  if (request.request_availability) requestedItems.push('Availability')
  if (request.request_package_details) requestedItems.push('Package Details')
  if (request.request_contact_update) requestedItems.push('Contact Update')

  const linkUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/respond/${request.token}`
    : `/respond/${request.token}`

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">
            Sent {new Date(request.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Requested: {requestedItems.join(', ')}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[request.status]}`}>
          {statusLabels[request.status]}
        </span>
      </div>

      {request.personal_note && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
          <p className="text-gray-500 text-xs mb-1">Note from {partnerName}:</p>
          <p className="text-gray-700 italic">&quot;{request.personal_note}&quot;</p>
        </div>
      )}

      {request.status !== 'completed' && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Link:</span>
          <code className="bg-gray-100 px-2 py-1 rounded text-xs flex-1 truncate">
            {linkUrl}
          </code>
          <CopyButton token={request.token} />
        </div>
      )}

      {/* Response */}
      {request.responses && request.responses.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {request.responses.map((response) => (
            <ResponseCard key={response.id} response={response} />
          ))}
        </div>
      )}
    </div>
  )
}
