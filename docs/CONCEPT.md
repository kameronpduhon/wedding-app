# Wedding Vendor Coordination App

**Status:** Concept/Planning
**Started:** Feb 2026

---

## The Problem

Brides book multiple vendors (photographer, DJ, caterer, florist, venue, etc.) but have no central place to:
- Collect invoices and contracts
- Track payments and due dates
- Get updates on packages/availability
- Coordinate the wedding day logistics

Everything lives in scattered emails, texts, and personal notes. Stressful.

**Validated by:** user research with a bride actively planning her wedding

---

## The Solution

A **bride-focused dashboard** where she can:
1. Add her vendors
2. Send request links (no vendor login needed)
3. Collect invoices, contracts, availability, updates
4. Track everything in one place
5. Generate a "Day-Of Packet" for all vendors before the wedding

### Key Insight
**Bride = primary user** (has account, controls everything)
**Vendors = responders** (just click a link and fill out info — no account needed)

This is realistic. Vendors won't sign up for another app, but they'll click a link.

---

## Core Features

### MVP (v1)
- [ ] Bride creates account + wedding (with date)
- [ ] Add vendors (name, email, category)
- [ ] Send request links to vendors
  - Invoice upload
  - Availability/dates
  - Package details
  - Custom questions
- [ ] Dashboard shows all responses organized
- [ ] Budget tracker (total spent, deposits, due dates)

### v2 — Day-Of Coordination
- [ ] Generate "Wedding Day Packet" with one click
- [ ] Auto-sends to all vendors ~1 month before wedding
- [ ] Includes:
  - Venue address + arrival time per vendor
  - Full day schedule (setup, ceremony, reception, etc.)
  - Contact list of all other vendors
  - Vendor's specific responsibilities

### Future Ideas
- Timeline/checklist templates
- Vendor reviews/ratings
- Integrations (Google Calendar, reminders)
- Shared access (groom, wedding planner, MOH)

---

## Revenue Model

**Freemium + Subscription**

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Up to 3 vendors |
| Pro | $9.99/mo | Unlimited vendors, all features |

### 🔑 Trust-Building Pitch (Onboarding)
> "Enter your wedding date — we'll remind you to cancel your subscription after the big day."

**Why this matters:**
- Shows we're not trying to trap them
- Rare in SaaS = memorable and shareable
- Brides will tell their engaged friends

**Revenue math:**
- Average engagement: 12-18 months
- If avg subscription = 8 months → ~$80/bride
- 1,000 brides = $80,000

---

## Competition

| Competitor | What They Do | Gap |
|------------|--------------|-----|
| The Knot | Marketplace, website builder, checklists | Doesn't solve vendor communication |
| Zola | Registry + wedding website | Same — no vendor coordination |
| Joy | Free wedding websites | Guest-focused, not vendor-focused |
| Aisle Planner | Full planning software | Built for professional planners, not brides |
| HoneyBook | CRM for vendors | Vendor-facing, not bride-facing |

**Our lane:** Bride → vendor communication & coordination. Nobody owns this.

---

## User Flow

```
┌─────────────────────────────────────┐
│         BRIDE'S DASHBOARD           │
├─────────────────────────────────────┤
│ • My Wedding (date, venue)          │
│ • My Vendors (add/manage)           │
│ • Send Request (invoice, dates, etc)│
│ • View Responses (all in one place) │
│ • Budget Tracker                    │
│ • [v2] Day-Of Packet Generator      │
└─────────────────────────────────────┘
           │
           ▼ sends request link via email
┌─────────────────────────────────────┐
│    VENDOR RESPONSE PAGE (no login)  │
├─────────────────────────────────────┤
│ • Upload invoice/contract           │
│ • Answer bride's questions          │
│ • Confirm dates/times               │
│ • Submit → flows back to dashboard  │
└─────────────────────────────────────┘
```

---

## Tech Stack (TBD)

Ideas:
- **Frontend:** React / Next.js
- **Backend:** Node.js or Python (FastAPI)
- **Database:** PostgreSQL or Supabase
- **Auth:** Supabase Auth / Clerk
- **Emails:** Resend / SendGrid
- **Hosting:** Vercel / Railway

---

## User Research — Real Bride Interview

**Q: What's the biggest headache right now?**
> Keeping track of invoices/contracts. They're all in my personal email.

**Q: How many vendors?**
> 14 vendors

**Q: Where does all that info live?**
> Emails, wedding website, and a wedding planning notebook.

### Insights
- Primary pain = invoices/contracts lost in email
- 14 vendors = way more than expected, organization is critical
- Using 3 systems (email, website, notebook) and still struggling
- Wedding websites don't solve vendor management

---

## Open Questions

1. Name? (TBD — nothing clicked yet)
2. Do we charge vendors for anything? (featured listings, verification badge?)
3. Mobile app needed or web-only MVP?

---

## Next Steps

- [ ] Finalize feature list for MVP
- [ ] Pick tech stack
- [ ] Design basic wireframes
- [ ] Build it

---

## Notes

*Feb 2026 — Initial brainstorm. Idea validated against a real bride's pain points during user research.*
