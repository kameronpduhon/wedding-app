'use client'

import { createClient } from '@/lib/supabase/client'

interface ResponseCardProps {
  response: {
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
  }
}

export function ResponseCard({ response }: ResponseCardProps) {
  const supabase = createClient()

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('vendor-files')
      .download(filePath)

    if (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
      return
    }

    // Create download link
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'invoice': return '💰'
      case 'contract': return '📝'
      default: return '📎'
    }
  }

  return (
    <div className="bg-green-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-green-600">✅</span>
        <span className="text-sm font-medium text-green-700">
          Response received {new Date(response.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>

      {/* Vendor Note */}
      {response.vendor_note && (
        <div className="bg-white rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-500 mb-1">Note from vendor:</p>
          <p className="text-gray-700 text-sm">"{response.vendor_note}"</p>
        </div>
      )}

      {/* Files */}
      {response.files && response.files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Attached files:</p>
          {response.files.map((file) => (
            <button
              key={file.id}
              onClick={() => handleDownload(file.file_path, file.file_name)}
              className="w-full flex items-center gap-3 bg-white rounded-lg p-3 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-xl">{getFileIcon(file.file_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{file.file_name}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {file.file_type} {file.file_size && `• ${formatFileSize(file.file_size)}`}
                </p>
              </div>
              <span className="text-pink-500 text-sm">Download</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
