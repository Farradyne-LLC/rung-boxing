# Punch platform release — 2026-10-13

## Behavior
- Partners is an opt-in directory of approved adult public profiles. Unpublished/private/minor records remain excluded; contact details and birth dates are not returned.
- Fighters compare boxing details and express interest. Interest, acceptance by both fighters and organizer confirmation are separate states.
- My Punch uses single-use email sign-in links. It contains profile/photo management, requests, sessions, notifications, private notes, completed rounds and content orders.
- Session Desk provides capacity/waitlist management, pair proposals, separate responses, organizer approval, attendance and actual rounds. Material session changes invalidate prior acceptance. Existing pending/paid orders block material changes.
- Content Pack remains $99 USD for one agreed sparring recording plus one shared vertical reel, offered after organizer confirmation and agreement to order-specific terms. Highlight Edit and Private Shoot remain separate quote requests.
- No real payment enablement, automated acceptance, fake public fighters, or silent publication consent.

## Verification
- TypeScript and ESLint pass.
- Migration/slug/audit-permission checks pass; 9 form/service validation tests pass.
- Isolated PostgreSQL/API scenarios passed: application save, one-use login, profile version conflict, adult opt-in directory, access control, duplicate requests/enrollment, minor restrictions, pair responses, organizer approval, waitlist, changed details, actual rounds, own-only content/notes, block/report.
- Existing photo/avatar/cover flows and audited admin editing passed regression tests.
- Service quote request validation, dedupe, protected admin and CSV passed.
- Stripe test checkout verified $99 USD server price, terms acceptance, pair gating, repeated checkout reuse and no paid state from success redirect. Synthetic signed webhooks verified signature, amount, session and event dedupe. No real card charge/refund or client message was sent.
- Browser checked member login, partner comparison and synthetic request submission, organizer table; widths 360/390/430/1280 without page overflow.
- Live database backup restored into an isolated database; migrations 006–009 applied there successfully. Five existing applications retained.

## Operations
- App: Next.js/React in Node 24 Docker; isolated PostgreSQL 17, Caddy, filesystem photo storage, Resend outbox. No Vercel/Supabase runtime dependency.
- Public website: https://punchmentality.com
- Private organizer: http://100.102.7.5:3100/admin/platform (Tailscale + admin login).
- Preview: http://100.102.7.5:3102/partners. Synthetic records only; never copy this database to production.
- Backup: /srv/rung-boxing/backups/platform-before-20261013. Includes database and photos; at-switch backup captures intervening submissions.
- Release image: rung-boxing:platform-20261013. Root-owned compose remains /srv/rung-boxing/config/compose.yaml.
- Rollback: restore compose.yaml from the backup and recreate only the web service using config/images.env. Additive migrations can remain for the old app. Do not restore an old DB over newer submissions without a separate reconciliation plan.
- Other VPS services and public network/DNS settings are unchanged.

## Remaining operational choices
- Live Stripe stays off. Activation, account configuration and a genuine external webhook delivery check belong to payment launch.
- Existing fighters must explicitly opt into Partners; do not enable it in bulk. Organizer approves publication.
- Email notification preferences are separate from marketing permission. Test delivery remained disabled in preview; production inbox delivery is not inferred from queue insertion.
- Offsite backup destination remains unconfirmed. Current backups are on the same VPS.
- Confirm actual session dates/capacity and order scope/deadline before offering real sessions/content.
