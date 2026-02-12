'use client'

import { useState, useRef } from 'react'
import { SparklesIcon } from '@/components/icons'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VENDOR_NOTE_LENGTH = 5000

interface VendorResponseFormProps {
  requestId: string
  token: string
  requestInvoice: boolean
  requestContract: boolean
}

export function VendorResponseForm({ 
  requestId, 
  token,
  requestInvoice, 
  requestContract 
}: VendorResponseFormProps) {
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [vendorNote, setVendorNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const invoiceInputRef = useRef<HTMLInputElement>(null)
  const contractInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Client-side file size validation
      if (invoiceFile && invoiceFile.size > MAX_FILE_SIZE) {
        setError('Invoice file exceeds maximum size of 10MB')
        setIsSubmitting(false)
        return
      }
      if (contractFile && contractFile.size > MAX_FILE_SIZE) {
        setError('Contract file exceeds maximum size of 10MB')
        setIsSubmitting(false)
        return
      }

      const formData = new FormData()
      formData.append('requestId', requestId)
      formData.append('token', token)
      formData.append('vendorNote', vendorNote)
      
      if (invoiceFile) {
        formData.append('invoiceFile', invoiceFile)
      }
      if (contractFile) {
        formData.append('contractFile', contractFile)
      }

      const response = await fetch('/api/respond', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      setIsSubmitted(true)
    } catch (err: unknown) {
      console.error('Submit error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#5C7C65] mx-auto mb-4">
          <SparklesIcon size={28} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Thank you!
        </h3>
        <p className="text-gray-600">
          Your response has been submitted successfully.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Upload */}
      {requestInvoice && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Invoice or Quote
          </label>
          <input
            ref={invoiceInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <div 
            onClick={() => invoiceInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors duration-200
              ${invoiceFile 
                ? 'border-[#5C7C65] bg-[#E8F0E9]' 
                : 'border-gray-300 hover:border-[#87A98F] hover:bg-[#E8F0E9]/50'
              }
            `}
          >
            {invoiceFile ? (
              <div className="text-[#5C7C65]">
                <span className="text-2xl">✓</span>
                <p className="mt-2 font-medium">{invoiceFile.name}</p>
                <p className="text-sm">Click to change</p>
              </div>
            ) : (
              <div className="text-gray-500">
                <span className="text-2xl">+</span>
                <p className="mt-2">
                  Drag & drop or <span className="text-[#5C7C65] underline">browse files</span>
                </p>
                <p className="text-xs mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contract Upload */}
      {requestContract && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Contract
          </label>
          <input
            ref={contractInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setContractFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <div 
            onClick={() => contractInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors duration-200
              ${contractFile 
                ? 'border-[#5C7C65] bg-[#E8F0E9]' 
                : 'border-gray-300 hover:border-[#87A98F] hover:bg-[#E8F0E9]/50'
              }
            `}
          >
            {contractFile ? (
              <div className="text-[#5C7C65]">
                <span className="text-2xl">✓</span>
                <p className="mt-2 font-medium">{contractFile.name}</p>
                <p className="text-sm">Click to change</p>
              </div>
            ) : (
              <div className="text-gray-500">
                <span className="text-2xl">+</span>
                <p className="mt-2">
                  Drag & drop or <span className="text-[#5C7C65] underline">browse files</span>
                </p>
                <p className="text-xs mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vendor Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your response (optional)
        </label>
        <textarea
          value={vendorNote}
          onChange={(e) => setVendorNote(e.target.value)}
          rows={3}
          maxLength={MAX_VENDOR_NOTE_LENGTH}
          placeholder="Add a note back to the couple..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#87A98F] focus:border-[#87A98F] outline-none transition-colors"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full py-4 rounded-lg font-medium text-white
          transition-all duration-200
          ${isSubmitting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-[#87A98F] hover:bg-[#5C7C65] active:scale-[0.99]'
          }
        `}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Response'
        )}
      </button>
    </form>
  )
}
