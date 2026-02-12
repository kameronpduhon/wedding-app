'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateVendorPositions(vendorIds: string[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Update each vendor's position based on array index
    const results = await Promise.all(
      vendorIds.map((id, index) =>
        supabase
          .from('vendors')
          .update({ position: index })
          .eq('id', id)
      )
    )

    const failed = results.filter(r => r.error)
    if (failed.length > 0) {
      console.error('Failed to update vendor positions:', failed.map(r => r.error))
      return { success: false, error: 'Failed to save vendor order' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('Error updating vendor positions:', err)
    return { success: false, error: 'Failed to save vendor order' }
  }
}
