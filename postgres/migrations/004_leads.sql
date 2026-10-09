CREATE TABLE application_leads (
 request_id uuid PRIMARY KEY, token_hash text NOT NULL,
 first_name text NOT NULL,email text NOT NULL,phone text NOT NULL,date_of_birth date NOT NULL,
 marketing_consent boolean NOT NULL DEFAULT false,consent_version text NOT NULL,
 source jsonb NOT NULL DEFAULT '{}',boxing jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 private_requested boolean NOT NULL DEFAULT false,
 application_id uuid UNIQUE REFERENCES applications(id)
);
CREATE INDEX leads_created ON application_leads(created_at DESC);
REVOKE ALL ON application_leads FROM PUBLIC;
GRANT SELECT,INSERT,UPDATE,DELETE ON application_leads TO rung_app;
