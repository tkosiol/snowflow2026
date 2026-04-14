# Snowflow 2026 - Project Status

**Last updated:** 2026-03-12

## Current State

The project builds successfully (`npx next build` passes) and all routes are functional.

### Completed

#### Phase 1: Project Setup
- [x] Next.js 16 with TypeScript, App Router, Turbopack
- [x] Tailwind CSS v4 + shadcn/ui (base-nova style)
- [x] Prisma v7 with PostgreSQL adapter (`@prisma/adapter-pg`)
- [x] NextAuth v5 (credentials provider, admin-only)
- [x] next-intl with DE/EN translations
- [x] Database schema: Admin, Trip, TripTranslation, GalleryImage, BookingInquiry, Page, PageTranslation, SiteSettings
- [x] Seed data: 2 trips (Slowenien, Scuol), admin user (`admin@snowflow.de` / `snowflow2026`), 3 CMS pages
- [x] Environment config (`.env.local`, `.env`)

#### Phase 2: Public Layout & Homepage
- [x] Navbar with logo, nav links, language switcher, mobile hamburger menu (Sheet)
- [x] Footer with contact info, social links, legal links
- [x] Homepage: hero section (placeholder bg, no video yet), about teaser, trip cards grid
- [x] Responsive design (mobile-first)
- [x] Language switching DE/EN

#### Phase 3: Trip Pages & Booking
- [x] Trip detail page (`/[locale]/trips/[slug]`) with all info sections
- [x] Booking form with Zod validation, trip pre-selection via URL param
- [x] API endpoint `/api/booking` — saves to DB + sends email notification
- [x] Trip dropdown populated from published trips

#### Phase 4: Static Pages & Gallery
- [x] CMS-managed pages: about, impressum, privacy (rendered from DB)
- [x] Gallery page with season tabs + lightbox (Dialog)

#### Phase 5: Admin Panel
- [x] Admin login page (`/admin/login`)
- [x] Dashboard with stats (published trips, inquiries count)
- [x] Trips CRUD with DE/EN translation tabs
- [x] Pages management (list + edit links)
- [x] Gallery management (placeholder page)
- [x] Booking inquiries list with inline status updates (NEW/CONTACTED/CLOSED)
- [x] Admin sidebar navigation
- [x] All admin API routes protected with auth

### Tech Details
- **DB:** Uses existing local Docker Postgres (`tillo:localdev123@localhost:5432/snowflow`)
- **Primary color:** oklch(0.35 0.1 260) — approximation of #314483
- **Prisma v7:** Uses `@prisma/adapter-pg` (no `datasourceUrl`, adapter-based)
- **Generated client:** `src/generated/prisma/` (gitignored)

---

## What's Next

### Security
- [ ] Add rate limiting to `POST /api/booking` (e.g. 5 requests/IP/hour via middleware)
- [ ] Add honeypot field to booking form (hidden input — reject submission if filled)

### Email (code change required)
- [ ] Replace Resend (`src/lib/email.ts`) with nodemailer + SMTP — env vars already exist in `.env.local`
- [ ] Test email delivery end-to-end with Netcup SMTP

### GDPR / Privacy
- [ ] Fill in controller details in privacy policy (name, street, postal code, city — currently placeholder text)
- [ ] Update privacy policy section 3 — replace "Resend Inc., USA" with Netcup own mail server (no USA transfer)
- [ ] Add privacy notice below booking form submit button (Art. 13 DSGVO — no checkbox needed, just a note linking to Datenschutzerklärung)

### Content & Admin
- [ ] Add Snowflow logo to `public/images/` and update Navbar
- [ ] Add actual trip images and update `imageUrl` in seed/admin
- [ ] Fill in CMS page content (Über uns, Impressum, Datenschutz) via admin panel
- [ ] Admin page editor — `/admin/pages/[id]/page.tsx` for editing page content (markdown/rich text per locale)
- [ ] Gallery image upload — implement actual file upload in admin gallery
- [ ] Trip delete confirmation dialog in admin

### SEO
- [ ] SEO meta tags + Open Graph per page (use `generateMetadata`) — booking page already done, remaining pages missing
