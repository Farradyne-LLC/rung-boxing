ALTER TABLE notification_outbox ADD COLUMN delivery_state text NOT NULL DEFAULT 'queued' CHECK(delivery_state IN ('queued','sent','failed_permanent','failed_transient'));
ALTER TABLE notification_outbox ADD COLUMN provider_status integer;
UPDATE notification_outbox SET delivery_state=CASE WHEN sent_at IS NOT NULL THEN 'sent' WHEN attempts>0 THEN 'failed_transient' ELSE 'queued' END;
CREATE INDEX outbox_delivery_state ON notification_outbox(delivery_state,next_attempt_at);
CREATE FUNCTION reserved_mail_recipient(address text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
 SELECT lower(split_part(address,'@',2)) ~ '(^|\.)(example\.(com|net|org)|invalid|test|localhost)$';
$$;
CREATE FUNCTION guard_mail_recipient() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF current_setting('punch.preview',true) IS DISTINCT FROM 'true' AND reserved_mail_recipient(NEW.recipient) THEN
  NEW.delivery_state='failed_permanent'; NEW.last_error='Reserved test domain is not deliverable in production.';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER outbox_recipient_guard BEFORE INSERT OR UPDATE OF recipient,delivery_state ON notification_outbox FOR EACH ROW EXECUTE FUNCTION guard_mail_recipient();
GRANT EXECUTE ON FUNCTION reserved_mail_recipient(text) TO rung_app;
ALTER TABLE applications ADD COLUMN contacted_at timestamptz;
ALTER TABLE applications ADD COLUMN contacted_by uuid REFERENCES admin_users(id);
