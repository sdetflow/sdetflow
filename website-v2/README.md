# SDETFlow Portfolio v2

A redesigned personal / engineering portfolio for Sumanth Gumedelli with a real admin content layer.

## Why this version

The current GitHub Pages site is static. This v2 keeps the UI fast and public, but moves every major piece of copy, social URL, project, experience item, CTA, SEO field, and theme value into admin-editable content.

## Stack

- Next.js + TypeScript
- Custom responsive UI (no template dependency)
- Supabase Auth + Postgres JSON content store
- Row Level Security so only admin users can save changes
- Vercel recommended for deployment

## What the admin can edit

- Name, roles, location, email
- Hero headline, intro, CTAs, statistics
- LinkedIn, Instagram, GitHub, SDETFlow and any additional social links
- About copy and mindset quote
- Innovation / contribution section
- Capability cards
- Projects and ordering
- Experience and ordering
- SEO title, description, OG image
- Contact CTA
- Theme colors and hero background image URL

## Safe rollout

This app lives in `website-v2/` and does **not** replace the current GitHub Pages site yet.

### 1. Supabase

Create a Supabase project and run `supabase/schema.sql` in the SQL editor.

In Supabase Auth, create your admin user, then promote it using the SQL shown at the bottom of `schema.sql`.

### 2. Environment

Copy `.env.example` to `.env.local` and fill:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Run locally

```bash
npm install
npm run dev
```

Public site: http://localhost:3000  
Admin: http://localhost:3000/admin

### 4. Deploy

Recommended: import the existing `sdetflow/sdetflow` repository into Vercel and set the Root Directory to `website-v2`. Add the two Supabase environment variables.

No new GitHub repository is required unless you want the personal portfolio separated from the SDETFlow source repository.

## Next production upgrades

- Supabase Storage image upload button instead of URL-only media fields
- Draft / publish revisions and rollback
- Live admin preview
- Audit history
- Custom domain
- Analytics
