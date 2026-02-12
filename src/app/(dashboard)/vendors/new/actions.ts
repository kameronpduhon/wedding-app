'use server'

import { createClient } from '@/lib/supabase/server'
import { FREE_VENDOR_LIMIT } from '@/lib/stripe'

interface CreateVendorInput {
  name: string
  category: string
  contact_name?: string
  email?: string
  phone?: string
  notes?: string
}

export async function createVendor(input: CreateVendorInput) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data: wedding, error: weddingError } = await supabase
    .from('weddings')
    .select('id, is_premium')
    .eq('user_id', user.id)
    .single()

  if (weddingError || !wedding) {
    return { error: 'No wedding found. Please complete onboarding first.' }
  }

  // Server-side vendor limit check
  if (!wedding.is_premium) {
    const { count, error: countError } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('wedding_id', wedding.id)

    if (countError) {
      return { error: 'Failed to check vendor count' }
    }

    if (count !== null && count >= FREE_VENDOR_LIMIT) {
      return { error: 'vendor_limit_reached' }
    }
  }

  const { error: insertError } = await supabase
    .from('vendors')
    .insert({
      wedding_id: wedding.id,
      name: input.name,
      category: input.category,
      contact_name: input.contact_name || null,
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
    })

  if (insertError) {
    return { error: insertError.message }
  }

  return { success: true }
}
