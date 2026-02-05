'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SendRequestButtonProps {
  vendorId: string
  vendorName: string
  vendorEmail: string | null
  hasActiveRequest: boolean
  variant?: 'default' | 'primary'
}

export function SendRequestButton({ 
  vendorId, 
  vendorName,
  vendorEmail,
  hasActiveRequest,
  variant = 'default'
}: SendRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [requestInvoice, setRequestInvoice] = useState(true)
  const [requestContract, setRequestContract] = useState(true)
  const [requestAvailability, setRequestAvailability] = useState(false)
  const [requestPackageDetails, setRequestPackageDetails] = useState(false)
  const [personalNote, setPersonalNote] = useState('')
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { data, error } = await supabase
      .from('requests')
      .insert({
        vendor_id: vendorId,
        request_invoice: requestInvoice,
        request_contract: requestContract,
        request_availability: requestAvailability,
        request_package_details: requestPackageDetails,
        request_contact_update: false,
        personal_note: personalNote || null,
        status: 'pending',
        sent_at: new Date().toISOString(),
      })
      .select('token')
      .single()

    setIsLoading(false)

    if (error) {
      console.error('Error creating request:', error)
      alert('Failed to create request: ' + error.message)
      return
    }

    const link = `${window.location.origin}/respond/${data.token}`
    setGeneratedLink(link)
  }

  const handleCopy = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setGeneratedLink(null)
    setCopied(false)
    setPersonalNote('')
    router.refresh()
  }

  const buttonClass = variant === 'primary'
    ? 'px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors'
    : 'px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors text-sm'

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={buttonClass}
      >
        {hasActiveRequest ? 'Send Another Request' : 'Send Request'}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {generatedLink ? (
              // Success state - show link
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-xl font-semibold text-gray-900">Request Created!</h3>
                  <p className="text-gray-600 mt-1">Share this link with {vendorName}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Request Link:</p>
                  <p className="text-sm text-gray-700 break-all font-mono">{generatedLink}</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCopy}
                    className="w-full py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
                  >
                    {copied ? '✓ Copied!' : 'Copy Link'}
                  </button>

                  {vendorEmail && (
                    <a
                      href={`mailto:${vendorEmail}?subject=Request from Wedding&body=Hi!%0A%0APlease use this link to submit your information:%0A%0A${encodeURIComponent(generatedLink)}%0A%0AThank you!`}
                      className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                    >
                      Open in Email
                    </a>
                  )}

                  <button
                    onClick={handleClose}
                    className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              // Form state
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Send Request to {vendorName}</h3>
                  <p className="text-sm text-gray-600 mt-1">Select what you need from this vendor</p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestInvoice}
                        onChange={(e) => setRequestInvoice(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-gray-700">📄 Invoice or Quote</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestContract}
                        onChange={(e) => setRequestContract(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-gray-700">📝 Contract</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestAvailability}
                        onChange={(e) => setRequestAvailability(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-gray-700">📅 Availability / Dates</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestPackageDetails}
                        onChange={(e) => setRequestPackageDetails(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-gray-700">📦 Package Details</span>
                    </label>
                  </div>

                  {/* Personal Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personal Note (optional)
                    </label>
                    <textarea
                      value={personalNote}
                      onChange={(e) => setPersonalNote(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors text-sm"
                      placeholder="Hey! Just following up on our conversation..."
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || (!requestInvoice && !requestContract && !requestAvailability && !requestPackageDetails)}
                    className={`
                      flex-1 py-2.5 rounded-lg font-medium text-white transition-colors
                      ${isLoading || (!requestInvoice && !requestContract && !requestAvailability && !requestPackageDetails)
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-pink-500 hover:bg-pink-600'
                      }
                    `}
                  >
                    {isLoading ? 'Creating...' : 'Create Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
