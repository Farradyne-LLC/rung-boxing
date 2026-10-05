# Punch VPS operations

## Current architecture

Next.js V3 → private Docker application → PostgreSQL 17. Supabase and Vercel are not required by this deployment. The Supabase package remains only as a compile-time query interface for the small parameterized PostgreSQL adapter; no Supabase client is instantiated, and no cloud database credentials are used. Historical Supabase migrations remain for the old deployment; VPS migrations live in `postgres/migrations`.

Staging visitor URL: http://100.102.7.5:3101 . Private operations URL: http://100.102.7.5:3100/admin . Both require the owner's Tailscale network. SSH aliases: `rung-vps`, `rung-vps-ts`; ordinary user `rungdeploy` has neither Docker nor sudo access. Deployment continues through the existing administrator SSH key.

Root-controlled configuration: `/srv/rung-boxing/config/compose.yaml`, `images.env`, `Caddyfile`. Secrets: `/srv/rung-boxing/secrets`. Source releases: `/srv/rung-boxing/releases/<commit>`. Never deploy user-writable scripts through sudo. Runtime `rung_app` is not a PostgreSQL superuser and cannot create databases/roles; schema migrations use this project's separate owner credentials.

## Administrator workflow

1. Connect Tailscale, open the private `/admin` URL and sign in. Owner email is `farukhimin@gmail.com`. Initial password is stored in a protected bootstrap file, never in Git or this document.
2. Filter/search applications and open a card. See contact/boxing/guardian details, up to three photos, supplied footage link, notes and status. Private photos require an authenticated admin request through the private ingress.
3. Review youth applications separately. Their visibility is forced Private; recording a guardian review does not publish their profiles.
4. For an adult who selected Public and consented, choose an uploaded avatar and approve publication. The card shows the public profile URL. Private profiles remain absent from public pages.
5. Upload sparring footage to your YouTube/Vimeo account separately, then add its HTTPS link and title under PROFILE VIDEOS. Draft videos remain admin-only. Publishing requires an approved adult Public profile and organizer confirmation of permission from everyone shown. No video-file uploads are accepted.
6. Manual matchmaking/session controls are retained. Standalone profile clips do not inflate documented session/round counts. Stripe remains disabled until configured and tested.
7. Export all applications as CSV for Excel or other tools. The separate opt-in subscriber export is for mailing platforms; participation alone is not a newsletter subscription. Campaign sending/unsubscribe handling belongs in the chosen mailing provider, not this transactional queue.

## Photos and submissions

Application POST accepts JSON or multipart with JSON `application` and up to three `photos`. JPEG/PNG/WebP only, 5 MiB per photo, single image, maximum 40 million input pixels, decoded and re-encoded to WebP at at most 1600×1600 with orientation applied and metadata removed. No original filenames or EXIF are retained. Files are in `/srv/rung-boxing/data/photos`, outside `public/`, served only through an authorization-checking route with no-store headers.

Server schema validation, Origin checks, honeypot, gateway body cap and PostgreSQL rate buckets are enforced. Gateway overwrites the client-IP header. Application request IDs are unique; a transaction/advisory lock saves the fighter, application, photo rows and notification together. Retry returns the existing application. Uncertain database commit outcomes do not delete potentially committed photos.

## Email

Recipient: **farukhimin@gmail.com**. `RESEND_API_KEY` and `EMAIL_FROM` must be configured in the root-only web environment; no keys in chat, Git or browser bundles. A verified sender domain is needed for normal external sending. Gmail here is the destination, not an SMTP credential.

Notification outbox is durable and independent of form success. Every minute, `rung-boxing-notify.timer` calls the private authorized retry endpoint. Advisory locking prevents concurrent queue workers; failed calls back off up to one hour, stop after ten attempts, and can be retried from Admin. Resend requests have deterministic idempotency keys. `sent_at` means provider acceptance, not proof of inbox delivery. Resend's deduplication window is finite (24 hours); a manually retried uncertain send after that window may duplicate an email, but never an application.

Actual inbox delivery is a launch gate until a sender is connected and tested. Never display “email delivered” just because an application was saved.

## Environment and migration

See `.env.example`. Runtime needs `APP_URL`, `ADMIN_URL`, `DATABASE_URL`, `DB_PASSWORD_FILE`, `PHOTO_DIR`, `ADMIN_EMAILS`, `ADMIN_NOTIFICATION_EMAIL`, `ADMIN_INGRESS_SECRET`, `APPLICATIONS_OPEN`, `CRON_SECRET`; Resend values enable email, Stripe values are optional and gated by `PAYMENTS_OPEN=false`.

Migration entry: `node scripts/migrate-postgres.cjs`, with the isolated database owner's connection URL and password-file path. The deployment administrator creates the non-superuser `rung_app` role first. Migrations run transactionally with a ledger/advisory lock; no destructive schema reset. `admin-bootstrap.cjs` creates the initial owner only if absent and never resets an existing password.

## Isolation and public launch

Web has no published host port. Caddy is the only ingress. Visitor ingress strips the private admin header and blocks `/admin`, `/api/admin` and `/api/notifications`; middleware independently rejects protected routes without the secret private ingress marker. Private photos check both that marker and a valid admin session. Never expose the private listener or the application port on a public address.

`deploy/Caddyfile.public-prepared` is a future TLS configuration, not evidence of deployment/certificate issuance. Before switching DNS, complete email delivery, phone test, backup/restore and authorization checks, then mount the public Caddy config, set public `APP_URL=https://punchmentality.com`, retain private `ADMIN_URL`, and publish only HTTP/HTTPS website ports. Keep private 8081 bound to Tailscale host port 3100. Validate Caddy, test issuance and HTTPS from an external network; a successful outgoing ACME request does not prove inbound validation or certificate issuance.

Observed DNS on 2026-10-05 UTC (2026-10-04 Los Angeles): apex A records `64.29.17.1`, `216.198.79.1`; www CNAME `7525b12fea242ee8.vercel-dns-017.com`; no apex AAAA returned. Proposed Porkbun change: replace the two apex A records with one A `144.126.147.212`; replace www CNAME with `punchmentality.com`; use a short TTL during migration. Preserve all MX/TXT/domain-verification records and nameservers. Verify live records immediately before changes.

Rollback before collecting new VPS data: restore those exact Vercel A/CNAME records and leave Vercel active until cutover is verified. After receiving real VPS applications, rollback must preserve/export the new database and photos and reconcile records; DNS reversal alone does not move data back to Supabase. Do not delete Vercel or Supabase data/projects until migration and retention are reviewed.

## Backups

`rung-boxing-backup.timer`: daily 10:00 UTC, fourteen local snapshots in `/srv/rung-boxing/backups`. Root-owned backup script pauses only Punch web writes, takes a custom-format `pg_dump` and photo archive with checksums, and resumes web even on failure. Restore-check creates a separate temporary database and photo directory, verifies records and file bytes, then removes only those temporary targets. Local backups share the VPS failure domain. **Offsite storage is not configured; owner confirmation of a destination is still required.** Hermes backup/reboot/timezone work is excluded.

## Tests

`npm run lint`, `npm run typecheck`, Docker production build; existing `tests/flows.spec.ts` for desktop/mobile. Explicit live staging tests: set `VPS_QA=1`, `QA_BASE_URL=http://100.102.7.5:3101`, `VPS_ADMIN_FILE` to the protected bootstrap credential file, then run `tests/vps.spec.ts`. Tracing is disabled during credential-bearing tests. Synthetic QA records are isolated by the `vps-qa-…@example.com` namespace and must be cleaned, including queued notifications, after verification. Never run cleanup against real participant records.

Embedded players use strict-origin-when-cross-origin so YouTube receives the site origin without the profile path, following https://developers.google.com/youtube/terms/required-minimum-functionality . External playback still depends on the video owner's embed permissions and the provider's availability.

Only the Punch web container and its database use America/Los_Angeles for date/age handling; the VPS host timezone is unchanged.
