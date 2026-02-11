import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

// Price for unlimited vendors (one-time payment)
export const UNLIMITED_VENDORS_PRICE = 2999 // $29.99 in cents

// Free tier vendor limit
export const FREE_VENDOR_LIMIT = 3
