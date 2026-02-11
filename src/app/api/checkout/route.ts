import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, UNLIMITED_VENDORS_PRICE } from '@/lib/stripe'

export async function POST() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's wedding
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id, is_premium')
      .eq('user_id', user.id)
      .single()

    if (!wedding) {
      return NextResponse.json({ error: 'No wedding found' }, { status: 404 })
    }

    if (wedding.is_premium) {
      return NextResponse.json({ error: 'Already premium' }, { status: 400 })
    }

    // Create Stripe Checkout Session
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Unlimited Vendors',
              description: 'Unlock unlimited vendor management for your wedding. One-time purchase, lifetime access.',
            },
            unit_amount: UNLIMITED_VENDORS_PRICE,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://weddingvendorhq.com'}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://weddingvendorhq.com'}/upgrade`,
      metadata: {
        wedding_id: wedding.id,
        user_id: user.id,
      },
      customer_email: user.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
