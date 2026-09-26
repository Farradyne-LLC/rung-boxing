# Punch Mentality V3 — implementation and launch boundaries

## Delivered preview

Built on the original Next.js App Router project, in `codex/punch-mentality-v3`.
New red/black/bone identity, provided logo artwork, generated hero, responsive landing, four-step application, separate updates form, sample portfolio, upcoming event page, completed pair-session layout and organizer state demonstration.

Pricing is free approved sparring during the pilot and optional $69 content interest. No checkout or purchase is represented as working.

Forms are deliberately **preview-only**. They validate and allow a complete walkthrough, but do not submit, persist, email or create accounts. The completion screen says nothing was sent. The original FormSubmit integration was removed because its consent/storage handling and receipt acknowledgement were not suitable for this preview.

All user-entered form data stays in React memory. No localStorage, cookies, database, analytics payloads or external form endpoints are used. Runtime hosting logs are outside this application behavior.

Public preference starts selected for adults. Publication consent boxes start unchecked. Selecting Private clears and disables publication selections. Under-18 dates force Private and the individual-review route. Recording and editing are separate from publication. Demo youth confirmation is blocked.

The public review route uses invented, anonymous scenarios only; it is not an admin interface or a substitute for server authorization. Demo Private toggles contain no real private data and are not an access-control system.

Profiles have no invented achievements. Unknown profile, event and pair identifiers return a not-found page. Video cards accurately show unavailable media, rather than fake players. No invented date, venue, partnership or review appears.

## Routes

- `/`: full marketing experience, FAQ, updates preview
- `/apply`: four-step application; `?content=yes` preselects content interest only
- `/fighters/demo`: public/private portfolio demonstration
- `/sessions/next`: unconfirmed next-event information
- `/sessions/demo/rounds/sample`: completed pair-session template
- `/preview/review`: application, attendance, delivery and consent-state demonstration
- `/privacy`, `/terms`, `/content-consent`: clearly marked draft product overviews, not final legal agreements

All routes carry noindex/nofollow metadata while the project remains a preview.

## Before public MVP

1. Decide package unit, highlight length, turnaround, revisions and payment conditions.
2. Confirm real next-event date, venue, arrival and session windows.
3. Obtain authorized footage and Anthony's approved fields and portrait.
4. Review participation, privacy and content agreements and youth/guardian procedure. Draft explanatory pages must not be presented as approved legal documents.
5. Connect durable submission storage. Only return a live success after the write is acknowledged; preserve fields on failure. Add server validation, abuse protection, consent timestamps/versioning, idempotency and separate newsletter enrollment.
6. Provide authenticated organizer access with authorized status transitions. Keep application, attendance and content-delivery records separate.
7. Establish private-media delivery with authenticated authorization and protected storage. Never place private footage in `/public` or rely on unlisted URLs as access control.
8. Store scoped consent per participant and verify both fighters for each shared publication. Establish change/removal handling before publishing.
9. Add privacy-conscious conversion events that never include form contents; measure actual return participation from attendance records.
10. Enable live registration only after those launch dependencies are ready; remove preview labeling/noindex at that time.

Main/production remain unchanged until the preview is approved.

## Asset provenance

- `public/brand/logo-horizontal.png` and `logo-stacked.png`: exact copies of the supplied logos, displayed with CSS framing. The logo is not redrawn or altered.
- `public/images/sparring-hero.png`: generated with the built-in imagegen tool, not an event photograph. The hero explicitly labels it a generated brand visual.
- Fonts: Barlow Condensed, Manrope, IBM Plex Mono via `next/font/google`, downloaded at build and served locally.

### Hero generation prompt

Create a photorealistic premium contemporary boxing sports editorial website hero photograph, landscape 3:2. Two adult amateur boxers sparring in an authentic dim Los Angeles gym ring, both wearing protective headgear, one in deep red headgear and matching red 16oz gloves on left, the other in cobalt blue headgear and matching blue gloves on right. Controlled technical sparring, close-range guarded exchange, shoulders and upper torsos, natural sweat and believable anatomy, no injury, no aggression theatrics. Dramatic overhead soft white gym lighting with deep near-black background, subtle authentic film texture, modern sports/streetwear campaign quality. Put the fighters primarily in the RIGHT two thirds of the picture, negative dark space on left for a website text overlay added separately. No text, no logos, no watermarks, no frames, no smoke or flames. Image must work as a dark large website hero, with red and blue gear clearly readable. Brand atmosphere serious disciplined modern sparring culture, contemporary not vintage sepia. This is a generated brand illustration, not documentation of an actual event.
