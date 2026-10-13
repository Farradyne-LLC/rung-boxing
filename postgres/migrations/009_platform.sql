-- Additive platform expansion. Existing applications, payments and media remain intact.
ALTER TABLE fighters ADD COLUMN directory_visible boolean NOT NULL DEFAULT false,
 ADD COLUMN looking_for_rounds boolean NOT NULL DEFAULT false,
 ADD COLUMN weight_updated_at timestamptz,
 ADD COLUMN availability_updated_at timestamptz,
 ADD COLUMN competition_weight numeric CHECK(competition_weight BETWEEN 50 AND 500),
 ADD COLUMN training_level text NOT NULL DEFAULT '',
 ADD COLUMN sparring_intensity text NOT NULL DEFAULT 'Technical/light',
 ADD COLUMN goals text[] NOT NULL DEFAULT '{}',
 ADD COLUMN available_days text[] NOT NULL DEFAULT '{}',
 ADD COLUMN available_times text[] NOT NULL DEFAULT '{}',
 ADD COLUMN available_dates date[] NOT NULL DEFAULT '{}',
 ADD COLUMN preferred_venues text NOT NULL DEFAULT '',
 ADD COLUMN travel_area text NOT NULL DEFAULT '',
 ADD COLUMN coach text NOT NULL DEFAULT '',
 ADD COLUMN bio text NOT NULL DEFAULT '',
 ADD COLUMN email_notifications boolean NOT NULL DEFAULT false,
 ADD COLUMN advertising_consent boolean NOT NULL DEFAULT false;
-- Legacy weight/availability dates are intentionally unknown, never fabricated.
ALTER TABLE sessions ADD COLUMN enrollment_status text NOT NULL DEFAULT 'draft' CHECK(enrollment_status IN ('draft','open','full','completed','cancelled')),
 ADD COLUMN capacity integer NOT NULL DEFAULT 20 CHECK(capacity BETWEEN 2 AND 200),
 ADD COLUMN duration_minutes integer NOT NULL DEFAULT 120 CHECK(duration_minutes BETWEEN 15 AND 720),
 ADD COLUMN format text NOT NULL DEFAULT 'Technical sparring',
 ADD COLUMN requirements text NOT NULL DEFAULT '',
 ADD COLUMN organizer text NOT NULL DEFAULT '',
 ADD COLUMN filming boolean NOT NULL DEFAULT false,
 ADD COLUMN planned_rounds integer NOT NULL DEFAULT 3 CHECK(planned_rounds BETWEEN 1 AND 12),
 ADD COLUMN round_seconds integer NOT NULL DEFAULT 180 CHECK(round_seconds IN (60,90,120,180)),
 ADD COLUMN revision integer NOT NULL DEFAULT 0;
UPDATE sessions SET enrollment_status=CASE WHEN status='COMPLETED' THEN 'completed' WHEN status='CANCELLED' THEN 'cancelled' WHEN is_public THEN 'open' ELSE 'draft' END;
ALTER TABLE matchups ADD COLUMN organizer_confirmed_at timestamptz,
 ADD COLUMN organizer_confirmed_by uuid,
 ADD COLUMN actual_rounds integer CHECK(actual_rounds BETWEEN 0 AND 12),
 ADD COLUMN completed_at timestamptz,
 ADD COLUMN attendance_a boolean,
 ADD COLUMN attendance_b boolean,
 ADD COLUMN revision integer NOT NULL DEFAULT 0;
CREATE TABLE member_login_links(token_hash text PRIMARY KEY,fighter_id uuid NOT NULL REFERENCES fighters(id),expires_at timestamptz NOT NULL,used_at timestamptz);
CREATE TABLE member_sessions(token_hash text PRIMARY KEY,fighter_id uuid NOT NULL REFERENCES fighters(id),expires_at timestamptz NOT NULL);
CREATE TABLE partner_requests(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),sender_id uuid NOT NULL REFERENCES fighters(id),recipient_id uuid NOT NULL REFERENCES fighters(id),session_id uuid REFERENCES sessions(id),proposed_at timestamptz,rounds integer NOT NULL CHECK(rounds BETWEEN 1 AND 12),format text NOT NULL,venue text NOT NULL,comment text NOT NULL DEFAULT '',status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','INTERESTED','DECLINED','CANCELLED')),created_at timestamptz NOT NULL DEFAULT now(),expires_at timestamptz NOT NULL DEFAULT now()+interval '14 days',CHECK(sender_id<>recipient_id));
CREATE UNIQUE INDEX partner_request_active ON partner_requests(sender_id,recipient_id) WHERE status IN ('PENDING','INTERESTED');
CREATE TABLE fighter_blocks(fighter_id uuid REFERENCES fighters(id),blocked_id uuid REFERENCES fighters(id),PRIMARY KEY(fighter_id,blocked_id),CHECK(fighter_id<>blocked_id));
CREATE TABLE fighter_reports(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),fighter_id uuid NOT NULL REFERENCES fighters(id),reported_id uuid NOT NULL REFERENCES fighters(id),reason text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),resolved_at timestamptz);
CREATE TABLE member_notifications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),fighter_id uuid NOT NULL REFERENCES fighters(id),message text NOT NULL,href text NOT NULL DEFAULT '/requests',created_at timestamptz NOT NULL DEFAULT now(),read_at timestamptz);
CREATE TABLE training_journal(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),fighter_id uuid NOT NULL REFERENCES fighters(id),date date NOT NULL,venue text NOT NULL,partner text NOT NULL,rounds integer NOT NULL CHECK(rounds BETWEEN 0 AND 24),notes text NOT NULL DEFAULT '',created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE matchup_private_notes(matchup_id uuid REFERENCES matchups(id),fighter_id uuid REFERENCES fighters(id),notes text NOT NULL,PRIMARY KEY(matchup_id,fighter_id));
CREATE INDEX member_notification_owner ON member_notifications(fighter_id,created_at DESC);
CREATE INDEX member_session_expiry ON member_sessions(expires_at);
CREATE INDEX applications_fighter_session ON applications(fighter_id,session_id);
GRANT SELECT,INSERT,UPDATE,DELETE ON member_login_links,member_sessions,partner_requests,fighter_blocks,fighter_reports,member_notifications,training_journal,matchup_private_notes TO rung_app;
-- Preserve legacy invitation links, but two yes responses no longer imply coach approval.
ALTER FUNCTION respond_matchup(text,boolean) RENAME TO respond_matchup_legacy;
CREATE FUNCTION respond_matchup(p_hash text,p_accept boolean) RETURNS text LANGUAGE plpgsql AS $$
DECLARE state text; mid uuid;
BEGIN
 state:=respond_matchup_legacy(p_hash,p_accept);
 SELECT matchup_id INTO mid FROM fighter_matchup_confirmations WHERE token_hash=p_hash;
 IF state='CONFIRMED' AND NOT EXISTS(SELECT 1 FROM matchups WHERE id=mid AND organizer_confirmed_at IS NOT NULL) THEN
  UPDATE matchups SET status='AWAITING_CONFIRMATION' WHERE id=mid;
  RETURN 'AWAITING_CONFIRMATION';
 END IF;
 RETURN state;
END $$;
ALTER FUNCTION manage_matchup(uuid,text,uuid) RENAME TO manage_matchup_legacy;
CREATE FUNCTION manage_matchup(p_id uuid,p_action text,p_actor uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 IF p_action='COMPLETE' AND NOT EXISTS(SELECT 1 FROM matchups WHERE id=p_id AND organizer_confirmed_at IS NOT NULL AND actual_rounds IS NOT NULL AND attendance_a AND attendance_b) THEN RAISE EXCEPTION 'Record organizer approval, attendance and actual rounds first'; END IF;
 PERFORM manage_matchup_legacy(p_id,p_action,p_actor);
 IF p_action='COMPLETE' THEN UPDATE matchups SET completed_at=now() WHERE id=p_id; END IF;
END $$;
REVOKE EXECUTE ON FUNCTION respond_matchup_legacy(text,boolean),manage_matchup_legacy(uuid,text,uuid) FROM PUBLIC;
-- Wrappers run as the application role; legacy functions retain role execute access.
GRANT EXECUTE ON FUNCTION respond_matchup(text,boolean),manage_matchup(uuid,text,uuid),respond_matchup_legacy(text,boolean),manage_matchup_legacy(uuid,text,uuid) TO rung_app;
