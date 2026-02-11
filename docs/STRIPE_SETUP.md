# 🔐 Stripe Setup Plan — Wedding Vendor HQ

## Part 1: Kameron's Tasks (Account Setup)

### 1. Create Stripe Account
- Go to [stripe.com](https://stripe.com) → Sign up
- Use your personal email (can change later)
- **Don't need a business entity yet** — can start as sole proprietor

### 2. Activate Your Account
Stripe will ask for:
- [ ] Full legal name
- [ ] Date of birth
- [ ] Last 4 of SSN (for tax/fraud purposes — required by law)
- [ ] Home address
- [ ] Phone number
- [ ] Bank account for payouts (where your money goes)

### 3. Business Info
- **Business type:** Individual/Sole Proprietor (for now)
- **Business name:** Wedding Vendor HQ
- **Product description:** "Wedding planning software for vendor coordination"
- **Website:** weddingvendorhq.com

### 4. Get API Keys
Once activated, go to **Developers → API Keys**:
- Copy the **Publishable key** (starts with `pk_`)
- Copy the **Secret key** (starts with `sk_`)
- Add to app's environment variables

---

## Part 2: Code Implementation (Drew)

### Database Changes
- [ ] Add `stripe_customer_id` to users/weddings table
- [ ] Add `is_premium` boolean (or `unlocked_at` timestamp)
- [ ] Add `payment_id` to track the transaction

### New Pages/Components
- [ ] Upgrade page (`/upgrade`) — shows pricing, handles checkout
- [ ] Success page (`/upgrade/success`) — confirms purchase
- [ ] "X/3 vendors" indicator on dashboard

### Backend
- [ ] Stripe Checkout session endpoint (creates payment link)
- [ ] Webhook endpoint (Stripe tells us when payment completes)
- [ ] Vendor limit check (block adding >3 if not premium)

### Flow
```
User clicks "Add Vendor" (at limit)
    ↓
Redirect to /upgrade
    ↓
Click "Unlock for $29.99"
    ↓
Stripe Checkout (hosted by Stripe)
    ↓
Payment success → webhook fires
    ↓
Mark user as premium
    ↓
Redirect to dashboard with success message
```

---

## Pricing Model

- **Free tier:** Up to 3 vendors
- **Paid:** $29.99 one-time fee → unlimited vendors

## Stripe Fees

- 2.9% + $0.30 per transaction
- On $29.99 sale: ~$1.17 in fees, keep ~$28.82
- No monthly fee on basic plan

---

## Environment Variables Needed

```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

*Created: Feb 11, 2026*
