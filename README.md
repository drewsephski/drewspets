# Drew’s Pet Care

A hyperlocal, founder-led pet-care site for Fox River Grove, Illinois and
nearby towns. Production canonical origin: **https://drewspets.com**.

## Request flow

Visitors can compare services and rates, then send a short request at /book.
Drew personally follows up to discuss fit, availability, pricing, and a meet &
greet. A request is not a confirmed booking and requires no payment. There are
no customer accounts, CRM, admin dashboard, or online payment lifecycle.

Booking and contact forms send a customer confirmation and a request email to
Drew through Resend. Set RESEND_API_KEY, EMAIL_FROM (on a verified Resend
domain), and ADMIN_EMAIL. DATABASE_URL is optional; when configured, the
existing inquiry table stores the request summary and rate limiting is
persistent. Without it, requests are delivered by email and rate limiting is
best-effort per running instance.

## Referrals and reviews

The /refer page describes the manually managed offer: after a referred friend
completes their first paid booking, Drew applies a $10 credit toward the
referrer's next booking. The friend should name their referrer in the optional
booking field. Drew keeps track and applies credits manually; there is no
referral ledger.

After a successful stay, Drew may send this message manually (replace [pet]
with the pet's name):

> Thanks again for trusting me with [pet]. If you know someone nearby who could
> use reliable pet care, I’d really appreciate the referral. When they complete
> their first paid booking, I’ll add a $10 credit to your next booking.

Referral requests and review requests must remain separate. Never condition a
credit on a review, its rating, or changing a review. If a Google review
request is added, use neutral wording such as: “If you’d like to share your
experience, an honest Google review helps local pet owners find Drew’s Pet
Care.” An optional future review URL can be configured with
NEXT_PUBLIC_GOOGLE_REVIEW_URL.

Approved customer testimonials belong in the testimonials array in
lib/content.ts. Add only real feedback with permission; no customer
endorsement is currently published.

## SEO and operations

NEXT_PUBLIC_SITE_URL defaults to https://drewspets.com; use
http://localhost:3000 for local development. Next.js permanently redirects
requests with the www.drewspets.com host to the apex while preserving paths
and query strings. Keep Vercel Project Settings → Domains aligned:

- `drewspets.com`: connected to Production, with no domain redirect.
- `www.drewspets.com`: permanent **308** redirect to `drewspets.com`.
- Production `NEXT_PUBLIC_SITE_URL`: `https://drewspets.com`.

The Next.js redirect is a fallback in the same direction. Never configure an
apex-to-www redirect in Vercel: it conflicts with the app and causes
`ERR_TOO_MANY_REDIRECTS`. Both domains must remain verified with valid DNS.
After domain or deployment changes, check HTTPS and HTTP on both hosts,
including `/book?service=dog-walking`, and confirm they finish at the HTTPS
apex with the path and query intact. Also check `/sitemap.xml` and canonical
metadata use the apex.

Service, location, rate, FAQ, testimonial, referral, and review-copy data live
in lib/content.ts. Public booking, service, and location pages use the apex
canonical origin. /apply and /refer stay accessible but are excluded from the
sitemap and marked noindex. Historical database declarations and migrations
remain to preserve data; they do not activate accounts, CRM, sitter management,
or booking/payment lifecycle features.

## Local checks

```sh
bun install
bun run format
bun run lint
bun run typecheck
bun test
bun run build
```
