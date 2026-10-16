# Punch Mentality v5 — verification and release record

Work date: 2026-10-15 (America/Los_Angeles). Base: `main`, `5e5a02b`. Branch: `codex/pm-v5-payments-email`. Human merge required. Implementation is prepared; observed preview results are recorded below. Real email delivery acceptance remains open; this is not authorization to release or enable live payments.

## Scope and isolation

The original `website-v3` checkout contained unrelated uncommitted training-network, session-board and matchup-record work. It was left intact. v5 uses a separate worktree based on main. That other work has migration numbers 010–013; reconcile numbering/order before combining branches. Never apply two different 010 migrations based only on a numeric prefix. Existing production data and admin ingress restrictions are preserved. No landing-page rewrite or new delivery/refund promise was made.

## A — Email

- `postgres/migrations/011_mail_delivery.sql`: queued/sent/failed_permanent/failed_transient states, provider status, reserved-domain database trigger. Existing sent messages become sent; old retry-exhausted messages become transient and eligible again. Preview connections explicitly set `punch.preview=true`; production defaults deny reserved test domains.
- `app/lib/mail-delivery.ts`, `app/lib/notifications.ts`: no silent ten-attempt cutoff; capped exponential backoff; 4xx terminal except 429 (rate limiting must retry); 5xx/network/invalid provider response transient. Provider response bodies and credentials are not logged. The provider idempotency key stays unchanged on retry.
- Reserved domains include example.com/net/org and subdomains, .invalid, .test and localhost. Such messages are retained as permanent failures rather than entering the send queue. Preview real delivery additionally requires an exact `MAIL_TEST_RECIPIENT` allowlist match.
- `app/api/applications/route.ts`: applicant confirmation is queued atomically with the application and includes a 15-minute one-use My Punch login link; existing administrator and photo-management notifications remain. Dedupe uses application ID.
- `app/admin/email/page.tsx`, `app/lib/v5-admin.ts`: filtered delivery list and audited retry of terminal failures. Reserved production addresses cannot be retried.
- Admin counter and daily owner alert for permanent failures or queued/transient mail older than `MAIL_ALERT_HOURS` (default 4). Daily keys use America/Los_Angeles; alerts do not recursively count themselves. Delivery failures still appear in the admin if email alerts themselves cannot be delivered.

## B — Payments

- `postgres/migrations/010_standalone_orders.sql`: keeps existing CONTENT_PACK, adds prepaid/highlight/shoot orders and AWAITING_SESSION. Pair ID is nullable; fighter ID is nullable only for service orders linked to service_requests, so editing customers do not need fighter profiles. Unique indexes protect concurrent prepaid reservations and one service order per request; a pair cannot receive both a prepaid and ordinary Content Pack.
- `app/api/checkout/standalone/route.ts`, `app/lib/standalone-checkout.ts`: authenticated member, current accepted version and offer hash, server Stripe price validation (9900 USD, one_time), saved terms snapshot, order locking and stable attempt/idempotency. No pairing prerequisite for prepayment. Existing gated checkout remains.
- `config/public-offer.yaml`, `app/lib/public-offer.ts`: intentionally incomplete owner template. Empty/zero/missing conditions return a clear 503. No invented scope, deadline or remedy. Deploy as a root-owned read-only server mount, outside public files. `/pay/content-pack` is not advertised on the landing page before approval.
- `app/lib/v5-admin.ts`: quote amount and agreed terms, version checking, private 14-day payment link, audit and customer outbox notification. Existing order prevents changing a quote behind the buyer's back.
- `/pay/service/[token]`, `/api/checkout/service`: private quote review and server-only amount; supplied client amounts are ignored. Independent of sparring registration. Verified webhook marks the linked request PAID and queues a receipt.
- `app/api/stripe/webhook/route.ts`: signature/mode/metadata/order/amount/session/attempt checks preserved and extended. Success redirects cannot grant PAID. Duplicate events and receipts are deduplicated. Matching a prepaid order later does not invalidate its original checkout metadata.
- `/admin/orders`: attach a paid prepaid order only to a confirmed pair containing that fighter, then NOT_STARTED; full audit, accepted payment terms preserved.
- Stripe account API was checked using the existing test key: dashboard display name is **UMH Studio inc**; `business_profile.name` was absent. Hosted Checkout was also opened: it shows **UMH Studio**, not Punch Mentality. Its existing product description still says content is purchased after matchup confirmation. Both brand and owner-approved product description need correction before prepaid live launch. No account settings or live keys changed.

## C — Operations

- `/admin` defaults to NEW, offers audited MARK CONTACTED (NEW becomes REVIEWING; other statuses are preserved). Daily owner digest lists NEW applications older than 24h; empty digest is not queued.
- Production cleanup actually executed after backup: **1 example.com outbox row + 1 example.com subscriber removed; all 6 applications preserved**. Backup: `/srv/rung-boxing/backups/pm-v5-hygiene/database.dump`; append-only audit action REMOVE_RESERVED_TEST_DATA. No synthetic production applications or payments created.
- `scripts/offsite-backup.sh`: explicit owner-provided rclone destination, completed database+photos backup required, immutable copy and integrity check; no sync/deletion. Not run: destination/credentials/encryption policy need owner input.
- Production code remains the prior release and PAYMENTS_OPEN remains false. New schema/code are preview-only until the human merges and approves release.

## D — Verification results

All database/API mutations below ran against `rung_preview`. No real charges/refunds or customer messages were sent.

| Check | Observed result |
|---|---|
| `npm run typecheck` | Exit 0; `tsc --noEmit` |
| `npm run lint` | Exit 0; `eslint app middleware.ts` |
| `node --import tsx --test scripts/test-services.ts scripts/test-v4.ts` | 9 tests, 9 pass, 0 fail |
| `node scripts/test-profile-migration.cjs` | PASS: migrations 001–011, unique stable readable slugs, append-only audit permissions |
| Docker production build | Next.js 15.5.26 / Node 24; optimized build, types, 26 static pages and standalone runtime built successfully |
| `node scripts/check-email-retry.cjs` in preview runner | PASS: 503 retry, attempts beyond 10, stable idempotency, 422 permanent/no repeat, 429 retry, reserved domains rejected before queuing, daily alert deduplication, unchanged applications. Injected provider; no actual email sent. |
| `V5_EMPTY_OFFER=true node scripts/test-v5-preview.cjs` | PASS: empty owner offer blocks prepayment; applicant/admin notification records and one-use login link persisted |
| `node scripts/test-v5-preview.cjs` | PASS: authenticated prepaid Checkout without pair; server $99; same checkout reused; signed payment/deduplication; AWAITING_SESSION; confirmed pair attachment/audit; service quote ignores client amount; PAID service/receipt; CONTACTED audit. Synthetic signed events used for these assertions. |
| Existing `test-services-preview.cjs` | PASS: service validation, both request types, dedupe, notification queue, protected admin, audited updates, stale-write rejection, CSV; existing pair checkout still requires both confirmations, organizer confirmation and accepted terms |
| Existing `test-stripe-webhook-preview.cjs` | PASS: bad signature, unpaid completion, wrong amount/session, duplicate event, one receipt, late failure cannot undo paid |
| Actual Stripe Sandbox card payment: prepaid | Test card 4242, USD 99.00; Stripe session `paid`; real forwarded signed event `evt_1UR287JPzImEgMZ7ar6xRA0l`; order `f27071fb-e438-487a-a21d-2931ddb94c67` PAID / AWAITING_SESSION / no matchup; exactly one queued receipt |
| Actual Stripe Sandbox card payment: service | Test card 4242, USD 73.00 (synthetic quote, not a published price); real forwarded signed event `evt_1UR29HJPzImEgMZ7UfIOpg0f`; order `b074345b-af91-4760-99ff-de39ebddd449` PAID; linked service PAID; one queued receipt |
| Public production read-only checks | Home 200; /admin, /api/admin/manage and /api/notifications all 404; unsigned webhook POST 400. Existing production image unchanged. |
| Browser admin | Password sign-in, NEW default, email-state filter and manual retry verified; retried synthetic row disappears from failed-permanent filter |

Actual card assertions are reproducible with `scripts/test-v5-card-payment.cjs <protected-checkout-fixture.json>` in the preview runner. The test script checks Stripe API state, actual event existence, database state and receipt dedupe; it does not mark orders paid itself. Stripe CLI forwarded real sandbox events privately to preview; no public preview ingress or production webhook setting was changed.

`Dockerfile` records the exact Node 24 multi-stage recipe used on preview; `.dockerignore` excludes local secrets, Git metadata and build dependencies. Runtime configuration remains externally mounted.

Build logs are protected on the VPS at `/root/rung-staging-setup/pm-v5-final-build.log`. Tests use builder dependencies (`NODE_PATH=/app/node_modules`), preview env and `/app-password` read-only mount. Never point them at production. Synthetic offer values were used only in preview for testing and the empty owner template was restored afterwards.

**Not verified:** actual Resend acceptance/inbox delivery (recipient authorization pending), scheduled production digest after deployment, live Stripe keys/webhook/branding, external backup/restoration. Browser review covered desktop admin and hosted Checkout; full responsive regression is not claimed. The production email acceptance check cannot be completed before separately approved deployment. Production PAYMENTS_OPEN stays false.

## Remaining owner decisions / acceptance gates

1. Fill and approve every field in `config/public-offer.yaml`, incrementing version when terms change. No prepayment may open with blanks.
2. Correct Stripe customer-visible branding (observed UMH Studio) and approve/update the product description for prepaid use. Recheck hosted Checkout before enabling live payments.
3. Activate live Stripe account, create its one-time USD 99 price, supply live secrets only through protected files. Never paste keys into chat or source control.
4. Authorize an exact recipient for the actual preview and production email delivery checks. Requested: farukhimin@gmail.com only. Real delivery is not yet verified.
5. Approve/configure external backup destination and credentials; run copy/check and a restoration test from that destination.
6. Human reviews/merges PR, resolves any migration-number collision with other pending work, and approves production deployment separately from enabling payments.
7. Both actual hosted sandbox payments passed after browser control recovered. Later an extension overlay blocked further screenshots; no bypass was attempted. Real mail delivery is still an acceptance gate.
8. Approve any future public CTA/promises changes separately. Current landing copy still describes the previously approved pair-gated offer.

## Exact production rollout and payment activation order

1. Human merges PR. Confirm main SHA and review pending migrations against `punch_internal.migrations`; stop on conflicting 010/011 files. Do not copy preview records or secrets.
2. Back up live database and photos under a new root-only directory; verify dump and retain current image/Compose. Reconfirm admin/public route isolation and PAYMENTS_OPEN=false.
3. Build reviewed image. Pause only `rung-boxing-notify.timer` for migration/deployment; apply 010 and 011 in transactions as rung_owner. Start only Punch web with the new image, using existing root-owned `/srv/rung-boxing/config/compose.yaml` and `/srv/rung-boxing/config/images.env`. Resume the Punch notification timer after the new worker is healthy. Do not touch other stacks.
4. Mount owner-approved `/srv/rung-boxing/config/public-offer.yaml` read-only at `/app/config/public-offer.yaml` (or set PUBLIC_OFFER_PATH). Root owns parent directories/config; deploy user cannot modify them. Confirm the unchanged application/photo paths, member auth, private admin and noindex private routes. Keep payments false.
5. Perform exactly one production delivery check using an owner-approved recipient and an existing authorized account/action; do not add a synthetic production application. Verify provider acceptance and actual inbox delivery separately.
6. Owner creates live Content Pack price: active, USD, unit_amount 9900, one_time. Verify customer-facing brand Punch Mentality on hosted Checkout. Do not enable until corrected.
7. Owner stores `STRIPE_SECRET_KEY`, `STRIPE_CONTENT_PACK_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` in protected `/srv/rung-boxing/secrets/web.env` (root:root 0600), not Git, console output or chat. Existing Compose loads this file. Test credentials stay only in the preview secret file.
8. Owner creates live webhook URL `https://punchmentality.com/api/stripe/webhook`, listening for checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired, charge.refunded. Verify unsigned requests receive 400; verify mode and signing secret match this endpoint. A successful outbound API call does not prove webhook delivery.
9. Confirm approved offer, quote workflow, external backup decision and completed sandbox acceptance. Only after **separate owner authorization**, set PAYMENTS_OPEN=true in the protected production env and recreate only Punch web.
10. Verify server pricing, cancellation/processing states, order/event/receipt visibility, admin isolation and health. Any live charge requires separate explicit owner-approved account/amount; no automatic live charge/refund as a smoke test.
11. Rollback: immediately set PAYMENTS_OPEN=false, retain database/orders/events/audit, restore prior app image only after compatibility review. Do not restore an old DB over new customer writes. Preserve both snapshots and reconcile data.

## Vercel — owner action only

After verified VPS production operation, export existing Vercel project settings and note the prior deployment/domain configuration. Confirm DNS still points to the VPS and no production route, email or asset depends on Vercel. Owner may then pause automatic deployments/remove the custom-domain association according to their chosen retention plan. Keep a recorded rollback deployment/config before deleting anything; do not change DNS as part of v5. No Vercel project was disabled or deleted here.

## Selected command output

```text
> punch-mentality@0.1.0 typecheck
> tsc --noEmit
(exit 0)
> punch-mentality@0.1.0 lint
> eslint app middleware.ts
(exit 0)
ℹ tests 9
ℹ pass 9
ℹ fail 0
PASS: migrations, unique stable readable slugs, append-only audit permissions
PASS empty owner offer blocks prepayment; applicant + admin mail and login link persisted.
PASS: 503 retry, attempts beyond 10, stable idempotency, 422 permanent/no repeat,
429 retry, reserved domains rejected before queuing, daily alert deduplication,
unchanged applications. No real mail sent.
PASS services: validation, two request types, retry dedupe, notification queue,
protected admin, audited updates, stale write rejection, CSV.
PASS checkout: both confirmations required, terms required, explicit acceptance,
$99 USD server price, one pending order/session, redirect cannot mark paid.
PASS synthetic webhooks: bad signature, unpaid completion, wrong amount/session,
duplicate event, one receipt queue, late failure cannot undo paid.
```

The two browser card payments additionally passed Stripe API + actual event + database + queued receipt assertions. Provider/inbox mail delivery is not implied by those passes. PR should remain draft until that acceptance item is closed.

Preview completion: temporary Stripe listener removed, original sandbox signing secret restored, empty owner offer restored; final empty-offer and email-retry checks passed again. Production code and payment flag remained unchanged.
