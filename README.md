# Wedding Vendor Coordinator

A bride-focused dashboard for managing wedding vendor communication and coordination.

## The Problem

Brides book 10-15+ vendors but have no central place to collect invoices, contracts, and coordinate the wedding day. Everything lives in scattered emails and texts.

## The Solution

- **Bride creates account** → adds vendors → sends request links
- **Vendors respond** (no account needed!) → upload invoices, contracts, availability
- **Everything in one place** → budget tracker, document storage, day-of coordination

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS
- **Email:** Resend
- **Hosting:** Vercel

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your keys
3. Run `npm install`
4. Run `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/              # Utilities and configurations
│   ├── supabase/     # Supabase client setup
│   └── resend.ts     # Email client
└── types/            # TypeScript types
```

## Roadmap

### MVP (v1)
- [ ] Bride authentication (signup/login)
- [ ] Create wedding profile
- [ ] Add/manage vendors
- [ ] Send request links to vendors
- [ ] Vendor response page (no login)
- [ ] Dashboard with responses
- [ ] Basic budget tracker

### v2
- [ ] Day-of coordination packet
- [ ] Timeline builder
- [ ] Shared access (groom, planner)
- [ ] Payment reminders

---

Built by Kameron & Drew 🦈

