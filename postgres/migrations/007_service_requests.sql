CREATE TABLE service_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_id uuid NOT NULL UNIQUE,
 kind text NOT NULL CHECK(kind IN ('HIGHLIGHT_EDIT','PRIVATE_SHOOT')),
 name text NOT NULL, email text NOT NULL, instagram text NOT NULL DEFAULT '',
 details jsonb NOT NULL, status text NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW','REVIEWING','NEEDS_MATERIAL','QUOTED','BOOKED','DELIVERED','DECLINED','CLOSED')),
 internal_notes text NOT NULL DEFAULT '', response_notes text NOT NULL DEFAULT '',
 version integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE ON service_requests TO rung_app;
