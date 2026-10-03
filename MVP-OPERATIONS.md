# Punch Mentality operations

Applications and update subscriptions are stored in Supabase, not email. `/admin` lists applications, internal notes, sessions, matchups, subscribers and queued notifications. Public routes use explicit field projections; private tables have RLS enabled and no anonymous/authenticated access. Admin requests validate a Supabase user against `ADMIN_EMAILS` on every request.

## Setup

Set the server-only values in `.env.example` through Vercel settings. Never add service-role, Postgres, Resend or Stripe credentials to a `NEXT_PUBLIC_` variable. Run `vercel env pull` locally. Run `npm run db:migrate` once per environment; migrations run transactionally, record a migration ledger and verify the Supabase PostgreSQL TLS certificate. The database health check is `node scripts/check-database.cjs`: its synthetic workflow is rolled back.

`APPLICATIONS_OPEN=true` enables saving applications and subscriptions. Set `APP_URL` to the exact trusted origin (production: `https://punchmentality.com`). Each preview environment needs its own origin to accept form submissions. Forms keep tab-scoped drafts for 24 hours and remove them after confirmed submission. Height is presented in feet/inches and centimeters, stored in inches.

## Email and administrator access

Configure `RESEND_API_KEY` and a verified `EMAIL_FROM` sender. Verify the sending domain's DNS in Resend; do not replace existing mailbox MX records. `ADMIN_NOTIFICATION_EMAIL` is currently `farukhimin@gmail.com`. New applications and subscriptions atomically queue a notification with the database write. Post-response delivery, a daily Vercel cron and the administrator retry button drain the queue. `sent_at` means accepted by the provider, not guaranteed inbox delivery. Check Resend delivery/bounce status when investigating missing mail. Pending or failed mail remains visible in `/admin`; database saves are not lost.

Visit `/admin/login` and request a one-time email link using an authorized address. The link opens a confirmation screen before it creates the secure HTTP-only session, so email scanners do not consume it. Existing Supabase admin users can also use a password. Public registration never creates an admin account.

## Admin workflow

1. Review an application, its footage and notes. Filter or export applications as CSV.
2. Record guardian review for a minor before matching. Minors cannot be published.
3. Create an upcoming session. Compare and manually select two applications, rounds and duration. Creating the matchup queues two private invitations.
4. Both fighters must confirm before paid checkout becomes available. Declining the Content Pack leaves participation unchanged.
5. Mark a confirmed matchup completed after the event; approve publication only with both adult participants' public consent. Attach approved HTTPS footage and publish eligible fighter profiles.

## Stripe: separate activation required

Keep `PAYMENTS_OPEN=false` until test Checkout and actual webhook delivery have been verified. Create a one-time USD 99 Stripe price and set `STRIPE_CONTENT_PACK_PRICE_ID`, `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from the same mode/account. Configure `https://punchmentality.com/api/stripe/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, and `charge.refunded`. Redirects never mark an order paid; signature-verified events do. Database checks do not replace a real Stripe test purchase. Confirm production delivery timing and refund handling before enabling payments.

## Media

`public/video/desktop.mp4` and `mobile.mp4` are the supplied loops; `poster.jpg` is the fallback. Both use muted autoplay, loop, playsInline and `object-fit: contain` at 16:9. Reduced-motion users get the poster. Photos from the supplied archive and training shoot are optimized in `public/images/gym`; `/gym` contains the editorial gallery.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm run build`, and the browser checks with `QA_BASE_URL` pointing to the running build. Real database application/subscriber writes and private-table access checks were exercised during setup; synthetic records were removed. Stripe and email inbox delivery require their live provider configuration and are not implied by a successful build.
