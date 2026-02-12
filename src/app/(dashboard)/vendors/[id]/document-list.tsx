'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TrashIcon } from '@/components/icons'

interface Document {
  id: string
  file_name: string
  file_type: string | null
  file_size: number | null
  storage_path: string
  uploaded_at: string
}

interface DocumentListProps {
  documents: Document[]
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(fileType: string | null): string {
  if (!fileType) return '📄'
  if (fileType.includes('pdf')) return '📕'
  if (fileType.includes('image')) return '🖼️'
  if (fileType.includes('word') || fileType.includes('document')) return '📝'
  if (fileType.includes('sheet') || fileType.includes('excel')) return '📊'
  return '📄'
}

export function DocumentList({ documents }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleDownload(doc: Document) {
    setError(null)
    const { data, error: downloadError } = await supabase.storage
      .from('vendor-documents')
      .createSignedUrl(doc.storage_path, 60) // 60 second expiry

    if (downloadError) {
      console.error('Download error:', downloadError)
      setError(`Failed to download "${doc.file_name}". Please try again.`)
      return
    }

    // Open in new tab
    window.open(data.signedUrl, '_blank')
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return

    setDeletingId(doc.id)
    setError(null)

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('vendor-documents')
        .remove([doc.storage_path])

      if (storageError) {
        setError(`Failed to delete file from storage. Please try again.`)
        return
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('vendor_documents')
        .delete()
        .eq('id', doc.id)

      if (dbError) {
        setError(`File removed from storage but failed to update database. Please refresh.`)
        return
      }

      router.refresh()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete document. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (documents.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">No documents uploaded yet.</p>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <button
            onClick={() => handleDownload(doc)}
            className="flex items-center gap-3 flex-1 text-left hover:text-[#5C7C65] transition-colors"
          >
            <span className="text-xl">{getFileIcon(doc.file_type)}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{doc.file_name}</p>
              <p className="text-xs text-gray-500">
                {formatFileSize(doc.file_size)}
                {doc.uploaded_at && ` • ${new Date(doc.uploaded_at).toLocaleDateString()}`}
              </p>
            </div>
          </button>
          <button
            onClick={() => handleDelete(doc)}
            disabled={deletingId === doc.id}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            title="Delete document"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
