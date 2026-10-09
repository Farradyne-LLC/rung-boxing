# Services and Stripe readiness — 2026-10-09

## Scope and preview
Private preview: http://100.102.7.5:3102 (Tailscale). Branch `feature/profile-management`.
The public deployment and its database remain unchanged. Preview uses only synthetic participant/request/payment records and its own database and photo volume. No customer emails or real charges were sent.

## Confirmed offer
- Free sparring, manual matching, no guarantee, purchases do not affect eligibility.
- Content Pack: $99 USD per fighter, Founding Price, one agreed sparring recording plus one shared vertical highlights reel. A personal highlight is a separate edit/order.
- Checkout only after both fighters confirm and the organizer supplies order details accepted by the buyer.
- Three rounds of corrections; turnaround agreed according to scope/material; delivery through Google Drive.
- Highlight Edit and Private Shoot: independent request forms, quote after review; no unapproved $49 price. Requests have separate admin tables, notes, statuses, CSV, and an audit trail. Replies are manual; saving internal response notes does not send email.

## Implemented
- Service pages and homepage links; clearer Content Pack page and agreed-terms snapshot on orders.
- Sessions owns upcoming/archive/video content. `/watch` redirects permanently to `/sessions#watch`.
- Public SEO is controlled by `SITE_INDEXABLE=true` and `SITE_PREVIEW=false`; canonical metadata, robots.txt and sitemap.xml are included. Private paths retain noindex and access controls. Preview demos return 404 outside preview mode.
- Stale V3 Preview messaging replaced with a truthful preview-only notice. Forms and checkout have their own readiness gates.
- Profile photo management, separate avatar/cover, secure expiring owner links, short stable public slugs, mandatory Instagram, and audited admin editing remain included.

## Verified
- TypeScript, ESLint, production Docker build; 9 schema tests; all 8 migrations against PGlite.
- Isolated Postgres/API integration: application/lead save, required Instagram, photos, retry deduplication, owner access, photo removal, avatar/cover, stale write rejection, admin audit, stable slugs/aliases, minor publication restriction.
- Services: both kinds save, validation and source-rights checks, deduplication, exactly one organizer notification per request, unauthenticated/public admin denial, status/reason validation, audit, CSV.
- Browser: service page mobile overflow/contrast, desktop view, request submit → confirmation → saved admin row/detail. Preview records persisted through application container replacement.
- Stripe sandbox: actual hosted Checkout with 4242 test card → Stripe signed event delivered through Stripe CLI → database PAID → browser verified-payment notice. Exactly one receipt queued. Actual Stripe expired event marked a separate order FAILED. Retrying reused the order with a new attempt/session. Declined test card showed an error; cancelling returned to the invitation without granting PAID.
- Checkout gating, fixed server $99 USD price, terms acceptance, session reuse, and fake success redirect not granting payment status.
- Additional synthetic signed webhook tests: invalid signature, wrong amount/session, unpaid completion, repeated event, and delayed failure after payment.
- Public-mode isolated container: 8 principal routes return 200 with canonical and without accidental noindex/preview; robots/sitemap correct; private paths noindex; `/preview` 404; `/watch` 308. No public port exposed for this test.

## Not yet verified / launch dependencies
- Real Stripe account activation, live product/price, live webhook endpoint and keys are deliberately not enabled. Hosted checkout currently displays the account brand “UMH Studio”; approve or configure the desired customer-facing business identity before launch. No real payments/refunds tested.
- Stripe 3DS, refund/dispute handling and actual receipt email delivery have not been tested end-to-end in this iteration. Do not claim these paths as fully verified.
- New email templates only queued in preview (no Resend key there). At launch verify delivery to an owner-authorized recipient; never enable mail on this synthetic-data database.
- Before an order is payable, supply agreed scope/round coverage, reel length, file formats, delivery date, cancellation and non-delivery remedy. These are not invented site-wide promises.
- Team role descriptions, precise arrival/parking details and testimonials require confirmed owner data. No fake reviews or qualifications added.
- Search Console ownership/sitemap submission is still separate. Removing technical indexing blocks does not guarantee Google inclusion or timing.
- Offsite backup destination and removed-photo retention policy remain owner decisions from the earlier infrastructure work.

## Release and rollback
1. Review this private preview. Approve public release separately from enabling live payments.
2. Back up live Postgres and protected photos, verify backup integrity, retain previous application image. Use existing admin access and root-owned deployment configuration; do not sudo scripts/Compose from a deploy-user-writable checkout.
3. Apply migrations 006–008 with the database owner; deploy matching image with the existing public videos mounted/copied. Keep admin/API/photo isolation and trusted proxy headers intact. Do not copy preview records or credentials to production.
4. Set `SERVICE_REQUESTS_OPEN=true`, `SITE_INDEXABLE=true`, `SITE_PREVIEW=false`; initially keep `PAYMENTS_OPEN=false` unless the live Stripe step has been completed separately. Configure existing production notification recipient farukhimin@gmail.com.
5. Live Stripe step: register `https://punchmentality.com/api/stripe/webhook`, set live secret/price/webhook signing secret securely, verify event types and readiness, then explicitly enable payments. Private preview currently uses a test-only Stripe CLI forwarder, not the future production endpoint.
6. Verify public HTTPS, key routes, robots/sitemap, private route denial and owner-authorized notification delivery. Request indexing through Search Console after publication.
7. Roll back to retained image and disable new service/payment gates if needed. Migrations are additive; keep database/receipts/audit data. Restore a pre-release database only after reconciling any new writes; never discard new applications or payment events silently.

## Local test commands
`npm run typecheck`, `npm run lint`, `node --import tsx --test scripts/test-services.ts scripts/test-v4.ts`, `node scripts/test-profile-migration.cjs`.
Preview-only scripts: `test-profile-preview.cjs`, `test-services-preview.cjs`, `test-stripe-webhook-preview.cjs`. They refuse a non-preview database or live Stripe key. Standalone image bundles the Stripe SDK; the integration runner requires a separately installed Stripe 23 test dependency through NODE_PATH. Test fixture IDs/links remain in protected local/server temporary files, never source control.
