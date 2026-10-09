ALTER TABLE fighters ADD COLUMN cover_photo_url text;
ALTER TABLE fighters ADD COLUMN edit_version integer NOT NULL DEFAULT 0;
ALTER TABLE fighters ADD COLUMN photo_version integer NOT NULL DEFAULT 0;
ALTER TABLE fighters ADD COLUMN profile_number bigint GENERATED ALWAYS AS IDENTITY UNIQUE;
CREATE TABLE fighter_slug_aliases(slug text PRIMARY KEY,fighter_id uuid NOT NULL REFERENCES fighters(id));
INSERT INTO fighter_slug_aliases SELECT public_slug,id FROM fighters;
CREATE FUNCTION punch_profile_slug(n bigint, name text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
 SELECT 'pm-' || CASE WHEN n<1000 THEN lpad(n::text,3,'0') ELSE n::text END || '-' || COALESCE(NULLIF(trim(both '-' from regexp_replace(lower(name),'[^a-z0-9]+','-','g')),''),'fighter');
$$;
UPDATE fighters SET public_slug=punch_profile_slug(profile_number,first_name);
CREATE FUNCTION assign_punch_profile_slug() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.public_slug=punch_profile_slug(NEW.profile_number,NEW.first_name); RETURN NEW; END $$;
CREATE TRIGGER fighter_profile_slug BEFORE INSERT ON fighters FOR EACH ROW EXECUTE FUNCTION assign_punch_profile_slug();
CREATE TABLE fighter_access_links(token_hash text PRIMARY KEY,fighter_id uuid NOT NULL REFERENCES fighters(id),expires_at timestamptz NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX fighter_access_expiry ON fighter_access_links(expires_at);
ALTER TABLE audit_log ADD COLUMN actor_label text;
ALTER TABLE audit_log ADD COLUMN changes jsonb NOT NULL DEFAULT '{}';
GRANT SELECT,INSERT,UPDATE,DELETE ON fighter_slug_aliases,fighter_access_links TO rung_app;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO rung_app;
GRANT EXECUTE ON FUNCTION punch_profile_slug(bigint,text),assign_punch_profile_slug() TO rung_app;
REVOKE UPDATE,DELETE ON audit_log FROM rung_app;
