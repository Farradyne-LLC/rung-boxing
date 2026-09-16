# Punch Mentality — Product Prototype V2

An evolution of `punch-redesign-v2`, built on the existing Next.js project.

## Product

Los Angeles-first, coach-led boxing development network. Every session creates experience, content and verified history. Public scope: adults 18+, controlled technical sparring, headgear, default 16 oz gloves (14 oz only with coach approval), on-site weigh-in and coach check-in. No scoring or sparring win/loss records.

## Routes

- `/`: editorial homepage, session media example, process, fighter passport, formats, pricing hypotheses, standards and FAQ.
- `/profile`: sample development passport and filterable session history.
- `/request`: participation confirmations first, fighter details, round preferences, review and demo receipt.
- `/apply`: redirect to `/request` for existing links.
- `/session`: sample session, cameras/rounds, clips, coach notes, stills, simulated check-in, privacy and mutual approvals.
- `/coaches`: partner request workflow concept.

## What works and what is simulated

This is a usability prototype, not a live registration service. Requests are validated and explicitly saved only to `sessionStorage` in the current browser tab. No email, payment, booking or actual coach notification occurs. A storage failure produces an error instead of a success receipt. The coach request form is an in-memory preview.

Verification and consent are local UI simulations, reset when the page is reloaded. Clip and full-session consent are separate. Both fighters must approve clips to enable demo sharing. Any copied link points to the public prototype screen, not private footage. There is no real authentication, permission enforcement, QR scanner, video upload or video playback.

All identities, activity metrics, gyms/coaches and coaching notes in the sample passport/session are illustrative fixtures. The uploaded imagery is generated concept art, not evidence of an actual participant or event. Dates in completed-session fixtures are deliberately historical. Price ranges are hypotheses; no checkout exists.

The earlier FormSubmit email endpoint was removed from this prototype to prevent test submissions from contacting anyone. Production registration requires a separately validated submission service and storage, plus real authorization for private media and consent.

## Assets

Eight user-supplied images are optimized to WebP in `public/images`. The final coach image has the tablet facing the participants. Barlow Condensed is bundled locally through the fontsource package; body text uses system fonts.

## Run

```sh
npm ci
npm run dev
npm run build
npm run start
```

## Architecture

Server-rendered marketing page and shared layout. Client components are limited to interactive navigation, request flow and product views. `lib/demo.ts` centralizes sample fighter/session/package data. Session IDs link profile history to session views and rematch requests. No production/main merge is part of this delivery.

## Verification

Production build and strict TypeScript checks. Browser checks cover 18+ validation, required confirmations, backward navigation retaining fields, demo request receipt, mandatory check-in requirements, two-party clip approval, full-session privacy separation, profile history filtering, mobile navigation and responsive overflow. See `QA.md` for the final record.
