'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PlusIcon } from '@/components/icons'

interface DocumentUploadProps {
  vendorId: string
}

export function DocumentUpload({ vendorId }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be less than 10MB')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${vendorId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('vendor-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Save record to database
      const { error: dbError } = await supabase
        .from('vendor_documents')
        .insert({
          vendor_id: vendorId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: fileName,
        })

      if (dbError) {
        // Rollback: delete orphaned file from storage
        await supabase.storage.from('vendor-documents').remove([fileName])
        throw dbError
      }

      // Refresh the page to show new document
      router.refresh()
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[#5C7C65] border border-[#87A98F] rounded-lg hover:bg-[#E8F0E9] transition-colors disabled:opacity-50"
      >
        <PlusIcon size={16} />
        {isUploading ? 'Uploading...' : 'Add Document'}
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
