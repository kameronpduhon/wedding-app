'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TrashIcon } from '@/components/icons'

interface DeleteVendorButtonProps {
  vendorId: string
  vendorName: string
}

export function DeleteVendorButton({ vendorId, vendorName }: DeleteVendorButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', vendorId)

    if (error) {
      console.error('Delete error:', error)
      setIsDeleting(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
      >
        <TrashIcon size={16} />
        Delete
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Vendor
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{vendorName}</strong>? This will also delete all requests and responses associated with this vendor. This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`
                  flex-1 py-2.5 px-4 rounded-lg font-medium text-white
                  transition-all duration-200
                  ${isDeleting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                  }
                `}
              >
                {isDeleting ? 'Deleting...' : 'Delete Vendor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
