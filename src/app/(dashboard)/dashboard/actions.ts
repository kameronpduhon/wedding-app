'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateVendorPositions(vendorIds: string[]) {
  const supabase = await createClient()
  
  // Update each vendor's position based on array index
  const updates = vendorIds.map((id, index) => 
    supabase
      .from('vendors')
      .update({ position: index })
      .eq('id', id)
  )
  
  await Promise.all(updates)
  revalidatePath('/dashboard')
  
  return { success: true }
}
