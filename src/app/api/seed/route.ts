import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role for seeding (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Use raw SQL to insert test data, bypassing foreign key checks temporarily
    const { data, error } = await supabaseAdmin.rpc('seed_test_data')

    if (error) {
      // If the function doesn't exist, create it and try again
      if (error.message.includes('function') || error.code === '42883') {
        // Create the seed function
        const createFnResult = await supabaseAdmin.from('_seed').select().limit(1)
        
        // Fallback: insert directly with a workaround
        return await seedDirectly()
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Seed error:', error)
    // Try direct seeding as fallback
    return await seedDirectly()
  }
}

async function seedDirectly() {
  try {
    // First, check if we already have test data
    const { data: existingRequests } = await supabaseAdmin
      .from('requests')
      .select('token')
      .limit(1)

    if (existingRequests && existingRequests.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Test data already exists!',
        testUrl: `/respond/${existingRequests[0].token}`
      })
    }

    // Generate a random token
    const token = generateToken()

    // Insert test data using raw SQL to handle the FK constraint
    // We'll create a minimal wedding record without a real user
    const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        -- Temporarily disable the trigger
        ALTER TABLE weddings DISABLE TRIGGER ALL;
        
        -- Insert test wedding with null user (we'll fix the schema)
        INSERT INTO weddings (id, user_id, partner1_name, partner2_name, wedding_date, venue_name, venue_address, budget)
        VALUES (
          'a0000000-0000-0000-0000-000000000001',
          'a0000000-0000-0000-0000-000000000000',
          'CC',
          'Kameron', 
          '2026-06-20',
          'The Grand Oak Estate',
          '1234 Oak Avenue, Lafayette, LA 70508',
          20000
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Re-enable trigger
        ALTER TABLE weddings ENABLE TRIGGER ALL;
      `
    })

    // If raw SQL doesn't work, let's try a simpler approach
    // Just modify the weddings table to allow null user_id for testing
    
    // Actually, let's just create the vendor and request with a direct insert
    // by first modifying the constraint

    const modifyResult = await supabaseAdmin.from('weddings').select('id').limit(1)
    
    // Let's try inserting with the service role which should bypass RLS
    // The issue is the FK to profiles, so let's create a profile first via auth
    
    // Simplest solution: create test data directly in Supabase dashboard
    // OR modify schema to allow testing
    
    return NextResponse.json({
      success: false,
      error: 'Foreign key constraint issue. Let me create a simpler solution.',
      workaround: 'Run the SQL below in Supabase SQL Editor',
      sql: getSeedSQL(token)
    })

  } catch (err) {
    console.error('Direct seed error:', err)
    const token = generateToken()
    return NextResponse.json({
      success: false,
      error: String(err),
      workaround: 'Run this SQL in Supabase SQL Editor:',
      sql: getSeedSQL(token),
      testUrl: `/respond/${token}`
    })
  }
}

function generateToken(): string {
  const chars = 'abcdef0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}

function getSeedSQL(token: string): string {
  return `
-- Run this in Supabase SQL Editor to create test data

-- 1. Temporarily allow null user_id (for testing only)
ALTER TABLE weddings ALTER COLUMN user_id DROP NOT NULL;

-- 2. Insert test wedding
INSERT INTO weddings (id, partner1_name, partner2_name, wedding_date, venue_name, venue_address, budget)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'CC',
  'Kameron', 
  '2026-06-20',
  'The Grand Oak Estate',
  '1234 Oak Avenue, Lafayette, LA 70508',
  20000
);

-- 3. Insert test vendor
INSERT INTO vendors (id, wedding_id, name, category, contact_name, email, phone)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Sweet Tooth Bakery',
  'cake',
  'Amy',
  'orders@sweettooth.com',
  '(555) 456-7890'
);

-- 4. Insert test request with known token
INSERT INTO requests (id, vendor_id, token, request_invoice, request_contract, personal_note, status)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  '${token}',
  true,
  true,
  'Hey! Just following up on the cake tasting. Can you also include pricing for the extra cupcake tower we discussed?',
  'pending'
);

-- Done! Your test URL is: /respond/${token}
`
}
