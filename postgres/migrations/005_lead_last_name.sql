ALTER TABLE application_leads ADD COLUMN last_name text NOT NULL DEFAULT '';
UPDATE application_leads l SET last_name=f.last_name FROM applications a JOIN fighters f ON f.id=a.fighter_id WHERE l.application_id=a.id;
