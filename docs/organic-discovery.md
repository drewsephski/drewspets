# Organic discovery for Drew’s Pet Care

## What the site supports

The homepage, seven service pages, ten town pages, service and coverage
directories, and `/guides/pet-sitting-rates` provide crawlable local information.
Titles, headings, canonical URLs, social previews, and internal links identify
the services and real service area. FAQ answers are rendered in the initial
HTML, with matching FAQ structured data. Business, founder, service, starting
offer, and breadcrumb markup use the same published facts.

`/about` identifies Drew as the person providing care, describes the care
process and coverage limits, and links to the confirmed Google listing and
the owner-supplied Sitterfolio profile. The business's `sameAs` points to
Google; the person's `sameAs` points to Sitterfolio. The rates guide includes
a visible author link and matching Article markup. Neither markup implies
an endorsement, review rating, or guaranteed search inclusion.

The town pages cover Fox River Grove, Cary, Barrington, Crystal Lake,
Algonquin, Lake in the Hills, Huntley, Wauconda, Island Lake, and Lake
Barrington. Fox River Grove and Cary are core; all other towns are reviewed
by request. Explicit coverage flags drive the directory labels, and the
coverage FAQ derives its town list from the same content. Adding a town
automatically updates the sitemap, homepage links, service-page links, and
business/service coverage markup. Nearby links must resolve to published towns.

Town titles and headings identify dog sitting and pet care. Each page has
distinct planning details and answers, starting rates, service links, and a
clear way to request coverage. WebPage and Service markup connect the town
to the single Fox River Grove business; there are no invented local branches.
Only published service and town slugs are routed, so unknown slugs return
404 rather than streamed 200 responses with homepage metadata.

The town pages describe travel and coverage limitations; they do not promise
availability. No reviews, ratings, credentials, public street address, or
24-hour care claims have been invented. The locality-only business address
describes the home base, not a walk-in premises. It does not satisfy every
Google LocalBusiness rich-result requirement; do not publish a private home
address just to clear a validator warning. FAQ markup describes the visible
answers; it does not imply eligibility for Google FAQ rich results.

`robots.txt` allows public pages for Google, Bing, OpenAI search, ChatGPT user
fetches, and Perplexity while excluding `/api/` for every declared crawler.
The wildcard already allowed these bots; explicit groups make that intent
auditable. Allowing crawlers does not guarantee indexing or recommendations.
No special AI text file is necessary for Google AI features.

## Launch and indexing

1. Deploy the reviewed changes to the existing production project. Keep
   `NEXT_PUBLIC_SITE_URL=https://drewspets.com`. Check that the apex returns
   200, www redirects to the apex, and neither loops or requires login.
2. Check `/robots.txt`, `/sitemap.xml`, `/services`, `/locations`, the rates
   guide, and one service and town page on the deployed domain. Check actual
   response HTML for unique titles, self-canonicals, readable answers, valid
   JSON-LD, and absence of `noindex` on acquisition pages. Check hosting bot
   protections as well as robots rules for OAI-SearchBot access.
3. Verify the domain in Google Search Console and Bing Webmaster Tools;
   submit `https://drewspets.com/sitemap.xml` to both. Use DNS verification,
   or set `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` to the actual
   provider-issued codes and redeploy. Request indexing for the homepage,
   Fox River Grove, Cary, Huntley, Wauconda, Island Lake, Lake Barrington,
   main services, and pricing guide. Inspect the four new URLs individually
   after deploying; their presence in the sitemap is not proof of indexing.
4. Validate structured data using Schema.org Validator and Google Rich
   Results Test. Inspect rendered HTML in Search Console. Treat rich-result
   eligibility and successful indexing as separate checks.

External account verification, sitemap submission, profile status, and
indexing have not been completed or verified by these source changes.
The October 3 live audit below establishes the narrower current observations.

## The local visibility work that matters next

- Finish verifying and completing the existing Google Business Profile.
  Use the real business name without added keywords, the closest available
  pet-sitter category, actual services, website and booking links, public
  contact details, accurate hours, and original photos. Keep a service-area
  profile with the home address hidden if customers are not served there.
  Fox River Grove and Cary are core; only list other towns you actually serve.
  Review Huntley, Wauconda, Island Lake, and Lake Barrington against actual
  travel and scheduling capacity before adding them to the profile. A town
  page invites coverage requests and does not establish a local office.
- Keep the business name, public phone, website, services, and coverage
  consistent on Google, Bing Places, Rover, and any real local directory.
  Check existing listings before creating duplicates. Link to verified
  profiles only after confirming their ownership and URLs.
- After completed care, ask every customer neutrally for an honest review.
  Never exchange reviews for referral credits, filter requests to happy
  customers, or invent endorsements. Configure the real
  `NEXT_PUBLIC_GOOGLE_REVIEW_URL` when available. Published testimonials
  require actual feedback and permission.
- Earn useful local mentions from real relationships with vets, groomers,
  community organizations, and neighborhood businesses. Avoid purchased
  link schemes or mass directory submissions. This is manual relationship
  work; no outreach messages were sent by this implementation.
- Improve pages using actual questions from local owners and photos from
  real care. Update rates and availability honestly. Avoid multiplying
  near-identical service-by-town pages or claiming to be the best without
  evidence.

## Measurement

Set the real `NEXT_PUBLIC_GA_ID` to enable existing GA4 support and/or
`NEXT_PUBLIC_VERCEL_ANALYTICS=true` for Vercel Analytics. GA4 now sends page
views after initialization, including the full landing URL so UTM attribution
is retained. In GA4 Enhanced Measurement, disable automatic page changes
based on browser-history events when using these explicit app page views,
to avoid duplicate route views. Mark `booking_request_submitted` as a key
event; form starts are not clients. Check GA4 DebugView and one successful
real request after deployment.

Review weekly:

- Search Console impressions, clicks, and query positions for pet sitting,
  dog sitting, dog sitter, dog walking, cat sitting, and house sitting paired
  with actual town names. Filter queries for “dog sitter near me,” “dog
  sitters near me,” “dog sitting near me,” and the four added towns; compare
  impressions, clicks, and completed requests over 28-day periods.
- Landing-page traffic, completed requests, and the manually tracked number
  of requests that become paid care. Use those to prioritize pages.
- Business Profile discovery and website actions where the dashboard
  provides them; do not interpret profile views as bookings.
- ChatGPT referrals via `utm_source=chatgpt.com` and other AI referrers.
  GA4 automatically handles UTM source attribution on landing URLs.

Sample discovery prompts to check manually after indexing: “pet sitter in
Fox River Grove,” “dog walker in Cary IL,” “cat sitter near Barrington,” and
“who offers overnight pet sitting near Fox River Grove and what does it
cost?” Answers vary by user location and search context. Record the date,
location, cited sources, and actual mentions rather than assuming one check
proves a stable ranking.

## October 2, 2026 audit and validation

The live homepage, location directory, robots file, and sitemap were
inspected. The homepage and directory returned 200 with apex canonicals
and index/follow directives. The live sitemap listed six town pages and
omitted the four added towns. Requests to the then-unpublished Huntley and
Wauconda paths returned 200 with homepage metadata, so service and town
routes now disable unpublished dynamic parameters and reject missing
content during metadata generation.

The web search used for this audit did not return a Drew’s Pet Care listing.
That is not evidence of Google index status or a local ranking measurement:
Search Console and the Business Profile dashboard are needed to establish
those facts. Deployment, provider verification, and sitemap submission are
separate from the code changes.

Run source checks with `bun run lint`, `bun run typecheck`, and `bun test`.
For HTTP regression checks, build and start the app, then run:

```sh
NEXT_PUBLIC_SITE_URL=https://drewspets.com bun run build
NEXT_PUBLIC_SITE_URL=https://drewspets.com bun run start --port 3000
# In a second terminal:
NEXT_PUBLIC_SITE_URL=https://drewspets.com SEO_TEST_BASE_URL=http://localhost:3000 bun test tests/seo-http.test.ts
```

These checks cover rendered town HTML, unique self-canonicals, indexability,
JSON-LD, visible answers, sitemap and directory inclusion, nearby links,
and real 404 responses. Without `SEO_TEST_BASE_URL`, the HTTP suite is
skipped so normal unit tests do not depend on a running server.
Use the production origin for the build, server, and HTTP checks: a local
`.env.local` may otherwise set a localhost canonical for development.

## October 3, 2026 live audit and next actions

The production homepage, contact page, house-sitting page, Huntley page,
robots file, and sitemap returned 200. Canonical URLs use the apex, www
redirects to it, and an unknown town returned 404. The sitemap now includes
all ten published towns. Requests bearing the OAI-SearchBot user agent
received public HTML without a login challenge. This checks user-agent
handling, not requests from OpenAI's actual crawler IP ranges.

Dia showed the Google owner dashboard and a Drew’s Pet Care knowledge
panel linking to `drewspets.com`. Branded Google results included the
homepage and privacy page. This establishes that those URLs appear in
Google, not that every town page is indexed or that generic local queries
rank well. The results were personalized to the signed-in owner in Fox
River Grove; this was not an independent local ranking measurement.

Google's Profile Strength indicator and performance report were available.
Google documents these as features for verified profiles, so the observed
profile appears verified. The report showed five profile views and zero
interactions for August through October 2026. The review dialog said
“Get your first review.” These are dashboard observations at the audit time,
not predictions of future traffic. The public listing had phone
`+12243431711`, primary category “Pet boarding service,” and “Open 24 hours.”
No Google profile fields, advertising settings, or hours were changed.

The confirmed Google listing and official review link are now published
constants in `lib/content.ts`; the existing public phone and review URL
environment variables can override their defaults. Structured data and
visible contact links use the same phone. The review request is neutral,
for people whose pets Drew has actually cared for, with no incentives.

Prioritize these next steps:

1. Review the Google primary category. “Pet sitter” better describes the
   site's primary positioning; confirm this matches actual business focus
   and the categories available in the profile before changing it. Add
   accurate secondary services rather than keywords to the business name.
   Review the 24-hour listing against actual customer contact hours; an
   overnight service does not establish continuous supervision or phone
   availability.
2. Align Sitterfolio's business identity. The owner-supplied profile at
   `https://drew.sitterfolio.com/` currently calls the business “Cozy Paws.”
   Use Drew’s Pet Care consistently if these represent the same business,
   and add a link back to `https://drewspets.com`. Until aligned, the site
   links it as Drew's personal sitter profile, not a business alias.
3. Ask customers after completed care for an honest Google review using
   `https://g.page/r/CUe9Duvb3Me-EBM/review`. No requests were sent by this
   work, and no reviews were copied or invented.
4. Confirm Search Console and Bing Webmaster Tools ownership and submit
   the sitemap. Inspect each priority town URL's indexing separately.
   These account and submission checks remain unverified in this audit.
5. Publish the local site changes, then inspect `/about`, `/contact`, the
   rates guide, sitemap, and homepage profile links on the production
   domain. Existing live SEO and new local enhancements are separate states.

For AI discovery, keep the existing allowed search crawlers, usable HTML,
consistent identity, factual answers, and links from real local sources.
Google states that its AI search features need no special AI text files or
schema. OpenAI identifies OAI-SearchBot as its search crawler. Satisfying
these discovery requirements does not guarantee a recommendation from
Google, ChatGPT, Perplexity, or another provider.

## Primary references

- [Google AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google local ranking](https://support.google.com/business/answer/7091?hl=en)
- [Google Business Profile performance and verification](https://support.google.com/business/answer/9918094?hl=en)
- [OpenAI crawlers](https://developers.openai.com/api/docs/bots)
- [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [OpenAI publisher discovery and referral tracking](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
- [Google local business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google doorway abuse policy](https://developers.google.com/search/docs/essentials/spam-policies#doorway-abuse)

Google local results depend on relevance, distance, and prominence. Clear
site information helps relevance; verified profiles, real reviews, and real
local recognition support discovery. No site change can ensure a top result
for every “near me” query or inclusion in a particular ChatGPT answer.
