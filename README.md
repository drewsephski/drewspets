# Drew’s Pet Care

A hyperlocal, founder-led pet-care site for Fox River Grove, Illinois and
nearby towns. Production canonical origin: **https://drewspets.com**.

## Request flow

Visitors can compare services and rates, then send a short request at /book.
Drew personally follows up to discuss fit, availability, pricing, and a meet &
greet. A request is not a confirmed booking and requires no payment. There are
no customer accounts, CRM, admin dashboard, or online payment lifecycle.

## Existing invoices and custom payments

Add your live hosted Stripe Payment Link to `.env.local`:

```sh
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/YOUR_LIVE_PAYMENT_LINK
```

Use the link already configured with “Customer chooses what to pay.” The
shared `PaymentCTA` supports `button` and `text-link` variants, custom `text`,
and `className`. It appears in the footer, homepage rates section, services
page, and below the booking form (including its success message). All payment
links open Stripe in a new tab. They stay hidden when the variable is empty.
Payments are handled entirely by Stripe. A signed webhook sends Drew a payment
text; payment does not confirm a booking.

Restart the development server after changing `.env.local`. For production,
set the same variable in your hosting environment and rebuild/redeploy;
Next.js embeds public environment variables at build time.

### Payment text alerts

Configure `STRIPE_PAYMENT_LINK_ID` with the live link’s `plink_` ID and
`STRIPE_PAYMENT_WEBHOOK_SECRET` with the signing secret for the dedicated
endpoint `https://drewspets.com/api/stripe/payment-notifications`. These are
server-only settings; never commit the signing secret. Register a snapshot
webhook in the same live Stripe account for `checkout.session.completed` and
`checkout.session.async_payment_succeeded`. Only paid live USD checkouts for
the configured link trigger texts to `ADMIN_SMS_TO` through the existing
Twilio sender. No Stripe SDK or API key is required by this endpoint.

Apply the latest database migrations before deployment. The
`payment_notifications` table keeps one SMS claim per Checkout Session,
including across distinct event types and concurrent retries. It stores the
amount, currency, event/session IDs, SMS attempt time, Twilio message SID, and
error code; customer identity is not retained in this table. Signatures are
checked against the raw request body with a five-minute timestamp tolerance.
Test-mode, unpaid, and unrelated-link events cannot send payment texts.

Explicit Twilio rejections return HTTP 503 and release the claim so Stripe can
retry safely. An ambiguous timeout, server failure, or failure to save a
successful send remains claimed and returns 503 on retries to avoid duplicate
texts. Review the affected session in Stripe and the message in Twilio before
manually clearing `sms_attempted_at`; never clear a claim when delivery is
uncertain. A stored message SID proves Twilio accepted the text; its delivery
status must be checked separately. This webhook does not reconcile invoices,
reserve dates, or create booking records.

## Inquiry delivery

Booking and contact forms send a customer confirmation and a request email to
Drew through Resend. Set RESEND_API_KEY, EMAIL_FROM (on a verified Resend
domain), and ADMIN_EMAIL. DATABASE_URL is optional; when configured, the
existing inquiry table stores the request summary and rate limiting is
persistent. Without it, requests are delivered by email and rate limiting is
best-effort per running instance.

Optional text alerts to Drew use Twilio. Set TWILIO_ACCOUNT_SID,
TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, and ADMIN_SMS_TO as server-only
environment variables. Both phone numbers must use E.164 format (such as
+12225550123); use an SMS-capable sender attached to an approved US A2P
campaign. SMS requires DATABASE_URL and the latest migrations; email-only
operation remains available without either SMS or database configuration.
Apply migrations with `bun --env-file=.env.local run db:migrate` before
deploying the SMS integration.

After both request emails are accepted, a short SMS summary goes only to the
configured admin number. The full request remains in email. SMS failures are
logged without submitted content or credentials and do not reject the form.
An atomic database claim prevents repeated API calls for the same request,
including concurrent retries. The claim is retained on failure or timeout to
avoid duplicate texts when Twilio acceptance is uncertain; there is no automatic
SMS retry. Inspect `inquiries.sms_attempted_at`, `sms_message_sid`, and
`sms_error_code` when diagnosing alerts. A saved message SID means Twilio
accepted the message, not that the receiving phone got it; check the Twilio
message's delivery status when verifying setup. Rotate credentials exposed in
chat and update local and production environments before redeploying.

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

See [the organic discovery launch guide](docs/organic-discovery.md) for local
search and AI discovery implementation, indexing, Business Profile work,
review practices, and measurement. Source improvements must be deployed and
recrawled before they can affect organic discovery.

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
or booking lifecycle features. Payment alert records are independent of those
historical tables.

## Local checks

```sh
bun install
bun run format
bun run lint
bun run typecheck
bun test
bun run build
```
