import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getServiceRoleClient } from '@/lib/supabase/service'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const weddingId = session.metadata?.wedding_id

    if (weddingId) {
      // Update wedding to premium
      const { error } = await getServiceRoleClient()
        .from('weddings')
        .update({
          is_premium: true,
          stripe_payment_id: session.payment_intent as string,
          upgraded_at: new Date().toISOString(),
        })
        .eq('id', weddingId)

      if (error) {
        console.error('Failed to update wedding:', error)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      console.log(`Wedding ${weddingId} upgraded to premium!`)
    }
  }

  return NextResponse.json({ received: true })
}
