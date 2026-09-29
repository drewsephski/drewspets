# Drew’s Pet Care

A local pet-care website for Drew in Fox River Grove. The site helps people discover Drew, understand services and rates, and request care. Drew handles follow-up personally.

## Run

Use Bun: `bun install`, copy `.env.example` to `.env.local`, then `bun dev`.
Set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` locally and `https://www.drewspets.com` in production. The bare domain redirects to `www.drewspets.com`, which is the origin accepted by the public forms.

Forms require `RESEND_API_KEY`, a verified `EMAIL_FROM`, and `ADMIN_EMAIL` (Drew’s inbox). Set public contact email/phone so visitors also have a direct fallback. Without email configuration the form reports unavailable; it never pretends a request was delivered.

`DATABASE_URL` is optional. When set, apply existing migrations with `bun --env-file=.env.local run db:migrate` before accepting requests. Bun does not load Next.js's `.env.local` automatically for the migration script. All three forms store a single record in the existing `inquiries` table (name, email, readable request summary). No new migration is required. Storage failures return an error rather than silently losing the record.

## Request flow

Service → dates → pet count/type/names and optional short notes → city or ZIP → name, phone, email → send. Drew receives all details with Reply-To set to the customer. The customer receives a short confirmation with Reply-To set to Drew. No account, address, payment, or detailed care intake is required. A request does not reserve dates.

Email calls are awaited. If delivery fails, the customer sees a retry message and their form stays filled. Resend idempotency keys deduplicate identical retries within the provider’s 24-hour window. The same form request ID deduplicates database inserts; changing an already-stored request requires a fresh request or personal follow-up. There is no background email queue. If a visitor abandons a partial email failure, Drew may already have the request but the customer may lack confirmation.

One rate-limit guard protects all public forms, with persistent counters when the database is configured and best-effort instance-local counters otherwise. Same-origin checks, a honeypot, bounded bodies, and shared Zod validation are retained. The database-free limit is not global across server instances; use hosting-level protection if abuse occurs.

## Product scope

Retained: homepage, service and location pages, rates, about Drew, reviews support, contact, future sitter interest, SEO metadata/JSON-LD/sitemap/robots, Vercel Analytics, Neon and Resend.

Removed from the application: admin/CRM, authentication, booking status pages and tokens, sitter assignment, availability management, notes, Stripe checkout/webhooks/reconciliation, and the email outbox cron. Historical database table declarations and migrations remain deliberately intact to avoid destructive changes to existing records. They are not active product features. Any future data cleanup needs a separate reviewed migration.

Deferred: payment links sent personally after agreement; more detailed intake after conversation. No sitter accounts or scheduling. The sitter form is only future interest.

## Content and launch

`lib/content.ts` owns services, starting prices, locations, FAQs and approved testimonials. Keep its established prices until Drew changes them. The current assets include pet photos, but no verified founder photo; replace an existing photo with Drew’s own approved photo when available. Do not invent client reviews. Google Business Profile verification, real reviews, and profile/site consistency require work outside this repository; source code alone does not establish Search or Maps rankings.

Before launch, verify the canonical domain, public phone/email, Resend domain and sender, Drew/customer inbox delivery, and database migrations when enabled.

## Checks

- `bun run format`
- `bun run lint`
- `bun run typecheck`
- `bun test`
- `bun run build`
- Browser smoke checks: homepage, mobile navigation, care request validation and success, contact, and future sitter interest.
