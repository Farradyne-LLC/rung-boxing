# Punch Mentality V3

Responsive, interactive **preview** of the V3 fighter experience. Built by evolving the existing Next.js site; see [the approved specification](docs/V3-SPEC.md) and [implementation / launch boundaries](docs/IMPLEMENTATION.md).

## Run locally

```sh
npm ci
npm run dev
```

## Verify

```sh
npx playwright install chromium
# With the local site running on port 3000:
npm run test:e2e
```

Ten browser scenarios cover desktop/mobile layouts, adult/youth applications, navigation, consent changes, preserved form values, organizer review/check-in rules, unavailable media and unknown/private-looking route IDs. Set `QA_BASE_URL` to check another host.

Stop the development server before building: Next.js build and dev share `.next`.

```sh
npm run build
npm start
```

## Preview boundaries

- Free coach-approved sparring during the pilot; optional $69 content interest.
- Application and newsletter forms are walkthroughs only: no storage, transmission, email or payment.
- Profiles, organizer review and completed-session pages use marked sample states, not real private data.
- No footage is published until supplied and cleared for use; no date or venue is invented.
- Draft legal information is labeled and must be replaced by reviewed agreements before live registration.
- Keep this branch and its Vercel deployment as a preview. Do not merge to `main` or promote to production until the owner approves.

## Dependencies

Next.js was patched within the existing v15 line, React within v19.1. A PostCSS override addresses the transitive audit findings without migrating the application to a new Next.js major version. The lockfile is committed.
