# Profile management preview

Branch: feature/profile-management. Live domain and live database have not been switched.

## Behaviour
- Instagram is required on boxing step 2; optional boxing fields remain visible.
- Up to three photos, removable before submission and afterwards through a private editing link. Avatar and optional cover are separate selections.
- Private editing links expire after seven days; only their hashes are stored. Request another at /profile/access. Responses do not disclose whether an email exists. Changing the email in admin revokes existing links.
- Public URLs use stable sequential identifiers, e.g. /fighter/pm-004-anthony. Existing aliases redirect only when the profile is eligible for public viewing. Public URLs never authorize editing.
- Photo changes and application edits unpublish the profile pending organizer review. Owner photo changes queue an organizer notification. Consent cannot be granted through the application editor. Minor and joint publication restrictions remain enforced.
- Admin edits require a reason, record actor/time/before/after, and reject stale versions. The application database role cannot modify or delete audit rows. Database owners remain privileged.
- Removed photos immediately become inaccessible through the application. Files remain in the protected storage volume for recovery; retention/garbage collection is not implemented in this change.

## Preview
http://100.102.7.5:3102 (Tailscale only). Separate database rung_preview, photo volume, credentials, and Docker project under /srv/rung-boxing-profile-preview. No live participant data is copied. Email and payments are disabled; notification queue creation is tested, actual delivery of the new messages is not. Gateway alone connects to the edge network; web/database use an internal network.

## Verification
- npm run lint; npm run typecheck
- node --import tsx --test scripts/test-v4.ts
- node scripts/test-profile-migration.cjs
- scripts/test-profile-preview.cjs runs ONLY inside the isolated preview container; guarded against a non-preview database, Resend credentials, or enabled payments. Uses synthetic data and test logo images.
- Browser: mobile contact/boxing steps, visible optional fields, photo selection/removal/re-addition, independent avatar/cover controls.

## Separate publication step
Before deployment, back up live Postgres and photo storage; apply migration 006 as the database owner through the existing root-owned deployment process, then deploy the matching application image. Verify legacy alias redirects, admin access isolation, and real email delivery using an owner-authorized test recipient. Do not roll the application back without considering the migrated short URLs and new fields. Keep backups and previous image for rollback. Never run a writable checkout as a privileged deployment script.
