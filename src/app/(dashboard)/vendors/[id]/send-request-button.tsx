'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SparklesIcon, MailIcon } from '@/components/icons'

interface SendRequestButtonProps {
  vendorId: string
  vendorName: string
  vendorEmail: string | null
  brideName: string
  hasActiveRequest: boolean
  variant?: 'default' | 'primary'
}

export function SendRequestButton({ 
  vendorId, 
  vendorName,
  vendorEmail,
  brideName,
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
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedBody, setCopiedBody] = useState(false)
  
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

  // Build the list of requested items for the email
  const getRequestedItems = () => {
    const items: string[] = []
    if (requestInvoice) items.push('invoice/quote')
    if (requestContract) items.push('contract')
    if (requestAvailability) items.push('availability')
    if (requestPackageDetails) items.push('package details')
    return items
  }

  // Generate email subject
  const getEmailSubject = () => {
    const items = getRequestedItems()
    if (items.length === 0) return `Document request for ${brideName}'s wedding`
    if (items.length === 1) return `Request for ${items[0]} - ${brideName}'s wedding`
    return `Document request (${items.join(', ')}) - ${brideName}'s wedding`
  }

  // Generate email body
  const getEmailBody = (link: string) => {
    const items = getRequestedItems()
    const itemsList = items.map(item => `• ${item.charAt(0).toUpperCase() + item.slice(1)}`).join('\n')
    
    return `Hi ${vendorName.split(' ')[0] || 'there'},

I hope you're doing well! I'm working on gathering documents for my upcoming wedding and would love your help.

Could you please send over the following:
${itemsList}

I've set up an easy upload link for you — no account needed, just click and upload:
${link}

${personalNote ? `A quick note: ${personalNote}\n\n` : ''}Thank you so much! Let me know if you have any questions.

Best,
${brideName}`
  }

  const handleCopyLink = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopySubject = async () => {
    await navigator.clipboard.writeText(getEmailSubject())
    setCopiedSubject(true)
    setTimeout(() => setCopiedSubject(false), 2000)
  }

  const handleCopyBody = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(getEmailBody(generatedLink))
      setCopiedBody(true)
      setTimeout(() => setCopiedBody(false), 2000)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setGeneratedLink(null)
    setCopied(false)
    setCopiedSubject(false)
    setCopiedBody(false)
    setPersonalNote('')
    router.refresh()
  }

  const buttonClass = variant === 'primary'
    ? 'px-4 py-2 bg-[#87A98F] text-white rounded-lg font-medium hover:bg-[#5C7C65] transition-colors'
    : 'px-4 py-2 bg-[#87A98F] text-white rounded-lg font-medium hover:bg-[#5C7C65] transition-colors text-sm'

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
              // Success state - show link and email options
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#5C7C65] mx-auto mb-3">
                    <SparklesIcon size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Request Created!</h3>
                  <p className="text-gray-600 mt-1">Share this with {vendorName}</p>
                </div>

                {/* Link Section */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Upload Link:</p>
                  <p className="text-sm text-gray-700 break-all font-mono">{generatedLink}</p>
                </div>

                <div className="space-y-3">
                  {/* Copy Link */}
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-3 bg-[#87A98F] text-white rounded-lg font-medium hover:bg-[#5C7C65] transition-colors"
                  >
                    {copied ? '✓ Link Copied!' : 'Copy Link'}
                  </button>

                  {/* Open in Email App */}
                  {vendorEmail && (
                    <a
                      href={`mailto:${vendorEmail}?subject=${encodeURIComponent(getEmailSubject())}&body=${encodeURIComponent(getEmailBody(generatedLink))}`}
                      className="flex items-center justify-center gap-2 w-full py-3 border border-[#87A98F] text-[#5C7C65] rounded-lg font-medium hover:bg-[#E8F0E9] transition-colors"
                    >
                      <MailIcon size={18} />
                      Open in Email App
                    </a>
                  )}

                  {/* Copy Subject & Body separately */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopySubject}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                      {copiedSubject ? '✓ Copied!' : 'Copy Subject'}
                    </button>
                    <button
                      onClick={handleCopyBody}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                      {copiedBody ? '✓ Copied!' : 'Copy Body'}
                    </button>
                  </div>

                  {/* Preview of email */}
                  <details className="text-sm">
                    <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
                      Preview email template
                    </summary>
                    <div className="mt-3 bg-gray-50 rounded-lg p-4 text-gray-600 whitespace-pre-wrap text-xs">
                      <p className="font-semibold text-gray-700 mb-2">Subject: {getEmailSubject()}</p>
                      {getEmailBody(generatedLink)}
                    </div>
                  </details>

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
                        className="w-5 h-5 rounded border-gray-300 text-[#87A98F] focus:ring-[#87A98F]"
                      />
                      <span className="text-gray-700">Invoice or Quote</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestContract}
                        onChange={(e) => setRequestContract(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-[#87A98F] focus:ring-[#87A98F]"
                      />
                      <span className="text-gray-700">Contract</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestAvailability}
                        onChange={(e) => setRequestAvailability(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-[#87A98F] focus:ring-[#87A98F]"
                      />
                      <span className="text-gray-700">Availability / Dates</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestPackageDetails}
                        onChange={(e) => setRequestPackageDetails(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-[#87A98F] focus:ring-[#87A98F]"
                      />
                      <span className="text-gray-700">Package Details</span>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors text-sm"
                      placeholder="Hey! Just following up on our conversation..."
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be included in the email template</p>
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
                        : 'bg-[#87A98F] hover:bg-[#5C7C65]'
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
