import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role for seeding (bypasses RLS)
// In production, remove this endpoint or protect it
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Create a test wedding (without user for now)
    const { data: wedding, error: weddingError } = await supabaseAdmin
      .from('weddings')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // placeholder
        partner1_name: 'CC',
        partner2_name: 'Kameron',
        wedding_date: '2026-06-20',
        venue_name: 'The Grand Oak Estate',
        venue_address: '1234 Oak Avenue, Lafayette, LA 70508',
        budget: 20000
      })
      .select()
      .single()

    if (weddingError) {
      // If foreign key error, we need to create a fake profile first
      if (weddingError.message.includes('foreign key')) {
        // Create placeholder profile
        await supabaseAdmin
          .from('profiles')
          .upsert({
            id: '00000000-0000-0000-0000-000000000000',
            email: 'test@example.com',
            full_name: 'Test User'
          })

        // Retry wedding insert
        const { data: retryWedding, error: retryError } = await supabaseAdmin
          .from('weddings')
          .insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            partner1_name: 'CC',
            partner2_name: 'Kameron',
            wedding_date: '2026-06-20',
            venue_name: 'The Grand Oak Estate',
            venue_address: '1234 Oak Avenue, Lafayette, LA 70508',
            budget: 20000
          })
          .select()
          .single()

        if (retryError) throw retryError
        
        return await createVendorAndRequest(retryWedding.id)
      }
      throw weddingError
    }

    return await createVendorAndRequest(wedding.id)
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

async function createVendorAndRequest(weddingId: string) {
  // Create a test vendor
  const { data: vendor, error: vendorError } = await supabaseAdmin
    .from('vendors')
    .insert({
      wedding_id: weddingId,
      name: 'Sweet Tooth Bakery',
      category: 'cake',
      contact_name: 'Amy',
      email: 'orders@sweettooth.com',
      phone: '(555) 456-7890'
    })
    .select()
    .single()

  if (vendorError) throw vendorError

  // Create a test request
  const { data: request, error: requestError } = await supabaseAdmin
    .from('requests')
    .insert({
      vendor_id: vendor.id,
      request_invoice: true,
      request_contract: true,
      request_availability: false,
      request_package_details: false,
      request_contact_update: false,
      personal_note: 'Hey! Just following up on the cake tasting. Can you also include pricing for the extra cupcake tower we discussed?',
      status: 'pending'
    })
    .select()
    .single()

  if (requestError) throw requestError

  return NextResponse.json({
    success: true,
    message: 'Test data created!',
    testUrl: `/respond/${request.token}`,
    data: {
      wedding: weddingId,
      vendor: vendor.id,
      request: request.id,
      token: request.token
    }
  })
}
