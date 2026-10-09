# Wedding App

A wedding vendor coordination app. Brides add their vendors, send tokenized request links over email, and collect contracts, invoices, availability, and day-of details into one dashboard. Vendors respond from a public link with no login required.

I built this after talking to a real bride who had 14 vendors and was tracking everything across her personal email, a wedding website, and a paper notebook. Existing tools (The Knot, Zola, Joy) all focus on the guest-facing wedding website and skip the vendor coordination problem entirely. This app fills that gap.

## Features

- Bride dashboard with drag-and-drop vendor list (`@dnd-kit`)
- Tokenized vendor response pages (no account needed for vendors)
- Vendor request flow: invoices, contracts, availability, custom questions
- File uploads to two separate Supabase Storage buckets (response files and bride-uploaded documents)
- Transactional email via Resend with React Email templates
- Stripe Checkout one-time payment for the premium tier (unlimited vendors)
- Stripe webhook to mark a wedding as premium on payment completion
- Row Level Security across all tables, with a service-role client carved out only for public vendor pages
- Rate limiting on the checkout and respond endpoints
- Auth and route protection via Next.js middleware
- Responsive Tailwind UI with custom design system

## Tech Stack

- Framework: Next.js 16 (App Router) with TypeScript
- Database / Auth: Supabase (Postgres + RLS)
- Payments: Stripe (Checkout + webhook signature verification)
- Email: Resend with `@react-email/components`
- Drag and drop: `@dnd-kit/core` and `@dnd-kit/sortable`
- Styling: Tailwind CSS v4

## Setup

### Prerequisites

- Node.js v18+
- A Supabase project
- A Stripe account (test mode is fine)
- A Resend account

### Install

```bash
npm install
```

### Database

Run the migrations in `supabase/migrations/` in order via the Supabase SQL editor:

```
001_initial_schema.sql
002_security_fixes.sql
003_performance_fixes.sql
004_split_hair_makeup.sql
005_vendor_position.sql
006_vendor_documents.sql
007_premium_upgrade.sql
008_unique_wedding_per_user.sql
```

Then follow `SETUP_INSTRUCTIONS.md` to create the two Supabase Storage buckets (`vendor-files` public, `vendor-documents` private with RLS policies).

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run

```bash
npm run dev
```

Visit `http://localhost:3000`, sign up, complete onboarding, and start adding vendors.

## Project Structure

```
wedding-app/
├── src/
│   ├── middleware.ts                 # Auth + route protection
│   ├── app/
│   │   ├── (auth)/                   # Login, signup, onboarding
│   │   ├── (dashboard)/              # Bride dashboard, vendors, settings
│   │   ├── respond/[token]/          # Public vendor response page (service-role)
│   │   ├── upgrade/                  # Premium upgrade page + success
│   │   └── api/
│   │       ├── checkout/route.ts     # Stripe Checkout session
│   │       ├── webhook/route.ts      # Stripe webhook handler
│   │       └── respond/route.ts      # Vendor response submission
│   ├── components/                   # Logo, footer, icons, shared UI
│   ├── emails/                       # React Email templates
│   ├── lib/
│   │   ├── supabase/                 # client / server / service-role
│   │   ├── stripe.ts
│   │   ├── resend.ts
│   │   └── rate-limiter.ts
│   └── types/database.ts             # Generated Supabase types
├── supabase/migrations/              # SQL migrations (8 files, run in order)
├── docs/                             # Concept doc, wireframes, palettes, naming
├── SETUP_INSTRUCTIONS.md             # Storage bucket and RLS policy setup

├── .env.example
└── package.json
```

## Architecture Notes

The bride is the only authenticated user. Vendors interact through a tokenized URL (`/respond/[token]`) that bypasses RLS using a separate service-role Supabase client. This avoids forcing vendors through a signup flow and keeps the bride in control of access by issuing or revoking tokens. RLS is enforced everywhere else.

Stripe is wired as a one-time payment, not a subscription. The webhook verifies the signature and flips a `has_premium` flag on the corresponding wedding row. Vendor limit enforcement happens server-side in dashboard server actions.

## License

MIT
