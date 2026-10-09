# V4 release handoff

Website: https://punchmentality.com
Private admin (Tailscale): http://100.102.7.5:3100/admin

Contact step saves a durable application_leads record. Boxing step updates the same record. Final submission converts it into an application and fighter; a private token hash protects updates. Duplicate retries use the same request ID. Marketing opt-in is separate. Youth stays private and requires guardian review.

Admin: boxing criteria first, filter applications, choose A and B to compare, then choose session and send invitations. Contacts tab includes unfinished applications, campaign source and marketing permission. CSV contacts export must not be treated as an opt-in mailing list; use opt-in export for newsletters.

Emergency contact is collected at session confirmation. Private arrangements are quote-only after application; no free hosting entitlement or automatic charge is created. A request prevents profile publication while arrangements are reviewed. Stripe payments remain disabled pending separate payment setup/testing.

Migration: postgres/migrations/004_leads.sql. Adds application_leads without changing or deleting existing fighter data. Runtime role receives only existing app-style table permissions. No new external services or secrets.

Video source files (owner supplied):
- C:\Users\Farukh Imin\Documents\ChatGPT\Punch mentality\PUNCH_SLOW_MOTION_V4\Punch_Mentality_Slow_Phone_1080x1350.mp4
- C:\Users\Farukh Imin\Documents\ChatGPT\Punch mentality\PUNCH_SLOW_MOTION_V4\Punch_Mentality_Slow_1440p.mp4

Web copies: public/video/slow-mobile-v4.mp4 (864x1080, 4:5), slow-desktop-v4.mp4 (1920x1080, 16:9). H264/AAC, faststart, 30 fps. No crop. Autoplay muted/loop/playsinline; music opt-in button; reduced-motion poster fallback. Original master files unchanged.

Rollback: restore previous web image in root-owned /srv/rung-boxing/config/compose-before-v4.yaml; restart only web. Keep migration/data so captured leads remain available. Do not restore an old database over incoming applications. Public DNS/TLS unchanged.
