#!/bin/sh
# Run as the existing server administrator. Destination must be supplied by owner.
set -eu
: "${OFFSITE_DESTINATION:?Owner must set an approved rclone remote:path}"
: "${BACKUP_DIR:?Choose an existing completed Punch backup directory}"
case "$BACKUP_DIR" in /srv/rung-boxing/backups/*) ;; *) echo 'Not a Punch backup directory' >&2; exit 1;; esac
test -d "$BACKUP_DIR"
test -f "$BACKUP_DIR/database.dump"
test -f "$BACKUP_DIR/photos.tar.gz"
command -v rclone >/dev/null
# Copy, never sync/delete. Configure remote credentials and encryption outside source control.
rclone copy "$BACKUP_DIR" "$OFFSITE_DESTINATION/$(basename "$BACKUP_DIR")" --immutable
rclone check "$BACKUP_DIR" "$OFFSITE_DESTINATION/$(basename "$BACKUP_DIR")" --one-way
echo 'Offsite copy and integrity check completed.'
