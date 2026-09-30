# Organic discovery for Drew’s Pet Care

## What the site supports

The homepage, seven service pages, six town pages, service and coverage
directories, and `/guides/pet-sitting-rates` provide crawlable local information.
Titles, headings, canonical URLs, social previews, and internal links identify
the services and real service area. FAQ answers are rendered in the initial
HTML, with matching FAQ structured data. Business, founder, service, starting
offer, and breadcrumb markup use the same published facts.

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
   Fox River Grove, Cary, main services, and pricing guide.
4. Validate structured data using Schema.org Validator and Google Rich
   Results Test. Inspect rendered HTML in Search Console. Treat rich-result
   eligibility and successful indexing as separate checks.

External account verification, sitemap submission, profile status, and
indexing have not been completed or verified by these source changes.

## The local visibility work that matters next

- Finish verifying and completing the existing Google Business Profile.
  Use the real business name without added keywords, the closest available
  pet-sitter category, actual services, website and booking links, public
  contact details, accurate hours, and original photos. Keep a service-area
  profile with the home address hidden if customers are not served there.
  Fox River Grove and Cary are core; only list other towns you actually serve.
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
  dog walking, cat sitting, and house sitting paired with actual town names.
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

## Primary references

- [Google AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google local ranking](https://support.google.com/business/answer/7091?hl=en)
- [OpenAI publisher discovery and referral tracking](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
- [Google local business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)

Google local results depend on relevance, distance, and prominence. Clear
site information helps relevance; verified profiles, real reviews, and real
local recognition support discovery. No site change can ensure a top result
for every “near me” query or inclusion in a particular ChatGPT answer.
