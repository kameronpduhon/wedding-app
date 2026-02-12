'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateVendorPositions(vendorIds: string[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Verify authenticated user and ownership
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (weddingError || !wedding) {
      return { success: false, error: 'Wedding not found' }
    }

    // Verify all vendor IDs belong to this wedding
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id')
      .eq('wedding_id', wedding.id)
      .in('id', vendorIds)

    if (vendorsError) {
      return { success: false, error: 'Failed to verify vendors' }
    }

    if (!vendors || vendors.length !== vendorIds.length) {
      return { success: false, error: 'Invalid vendor IDs' }
    }

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
