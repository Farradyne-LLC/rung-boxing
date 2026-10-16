-- Preserve existing matchup orders; service customers do not need fighter profiles.
ALTER TABLE orders ALTER COLUMN matchup_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN fighter_id DROP NOT NULL;
ALTER TABLE orders DROP CONSTRAINT orders_product_type_check;
ALTER TABLE orders ADD CHECK(product_type IN ('CONTENT_PACK','CONTENT_PACK_PREPAID','HIGHLIGHT_EDIT','PRIVATE_SHOOT'));
ALTER TABLE orders DROP CONSTRAINT orders_amount_check;
ALTER TABLE orders ADD CHECK(amount>0 AND (product_type NOT IN ('CONTENT_PACK','CONTENT_PACK_PREPAID') OR amount=9900));
ALTER TABLE orders DROP CONSTRAINT orders_content_status_check;
ALTER TABLE orders ADD CHECK(content_status IN ('AWAITING_SESSION','NOT_STARTED','EDITING','DELIVERED'));
ALTER TABLE orders ADD COLUMN service_request_id uuid REFERENCES service_requests(id);
ALTER TABLE orders ADD COLUMN offer_version integer;
ALTER TABLE orders ADD CHECK((product_type IN ('CONTENT_PACK','CONTENT_PACK_PREPAID') AND fighter_id IS NOT NULL AND service_request_id IS NULL) OR (product_type IN ('HIGHLIGHT_EDIT','PRIVATE_SHOOT') AND service_request_id IS NOT NULL AND matchup_id IS NULL));
CREATE UNIQUE INDEX one_prepaid_pack ON orders(fighter_id) WHERE product_type='CONTENT_PACK_PREPAID' AND matchup_id IS NULL;
CREATE UNIQUE INDEX one_service_order ON orders(service_request_id) WHERE service_request_id IS NOT NULL;
-- Cross-product protection: a prepaid pack attached to a pair replaces its ordinary pack.
CREATE UNIQUE INDEX one_pack_per_pair ON orders(fighter_id,matchup_id) WHERE product_type IN ('CONTENT_PACK','CONTENT_PACK_PREPAID');
ALTER TABLE service_requests ADD COLUMN quote_amount_cents integer CHECK(quote_amount_cents>0);
ALTER TABLE service_requests ADD COLUMN quote_currency text CHECK(quote_currency='usd');
ALTER TABLE service_requests ADD COLUMN quoted_at timestamptz;
ALTER TABLE service_requests ADD COLUMN quoted_by uuid REFERENCES admin_users(id);
ALTER TABLE service_requests ADD COLUMN quote_terms text;
ALTER TABLE service_requests ADD COLUMN quote_version integer NOT NULL DEFAULT 0;
ALTER TABLE service_requests ADD COLUMN payment_token_hash text UNIQUE;
ALTER TABLE service_requests ADD COLUMN payment_expires_at timestamptz;
ALTER TABLE service_requests DROP CONSTRAINT service_requests_status_check;
ALTER TABLE service_requests ADD CHECK(status IN ('NEW','REVIEWING','NEEDS_MATERIAL','QUOTED','PAID','BOOKED','DELIVERED','DECLINED','CLOSED'));

CREATE FUNCTION reserve_standalone_order(p_fighter uuid,p_product_type text,p_terms_version integer) RETURNS orders LANGUAGE plpgsql SET search_path=public AS $$
DECLARE o orders;
BEGIN
 IF p_product_type<>'CONTENT_PACK_PREPAID' OR p_terms_version<1 THEN RAISE EXCEPTION 'Invalid standalone product or terms'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('prepaid:'||p_fighter));
 INSERT INTO orders(fighter_id,product_type,content_status,offer_version) VALUES(p_fighter,p_product_type,'AWAITING_SESSION',p_terms_version) ON CONFLICT DO NOTHING;
 SELECT * INTO o FROM orders WHERE fighter_id=p_fighter AND product_type=p_product_type AND matchup_id IS NULL FOR UPDATE;
 IF o.payment_status IN ('PAID','REFUNDED') THEN RAISE EXCEPTION 'This pack has already been purchased'; END IF;
 IF o.payment_status='FAILED' THEN UPDATE orders SET payment_status='PENDING',attempt=attempt+1,stripe_checkout_session_id=NULL,checkout_expires_at=NULL,offer_version=p_terms_version WHERE id=o.id RETURNING * INTO o; END IF;
 IF o.offer_version<>p_terms_version THEN RAISE EXCEPTION 'Resolve existing checkout before changing terms'; END IF;
 RETURN o;
END $$;
GRANT EXECUTE ON FUNCTION reserve_standalone_order(uuid,text,integer) TO rung_app;

CREATE OR REPLACE FUNCTION record_payment(p_event text,p_order uuid,p_checkout text,p_intent text,p_state text,p_amount integer,p_currency text,p_refunded integer DEFAULT 0) RETURNS boolean LANGUAGE plpgsql SET search_path=public AS $$
DECLARE o orders; recipient_email text;
BEGIN
 SELECT * INTO o FROM orders WHERE id=p_order FOR UPDATE;
 IF o.id IS NULL THEN RAISE EXCEPTION 'Unknown order'; END IF;
 IF EXISTS(SELECT 1 FROM stripe_events WHERE id=p_event) THEN RETURN false; END IF;
 IF p_amount IS DISTINCT FROM o.amount OR p_currency IS DISTINCT FROM o.currency THEN RAISE EXCEPTION 'Payment amount mismatch'; END IF;
 IF o.stripe_checkout_session_id IS NULL OR p_checkout IS DISTINCT FROM o.stripe_checkout_session_id THEN RAISE EXCEPTION 'Checkout mismatch'; END IF;
 IF p_state='PAID' AND o.payment_status NOT IN ('PAID','REFUNDED') THEN
  UPDATE orders SET payment_status='PAID',stripe_payment_intent_id=p_intent,paid_at=coalesce(paid_at,now()) WHERE id=o.id;
  IF o.service_request_id IS NOT NULL THEN
   UPDATE service_requests SET status='PAID',updated_at=now(),version=version+1 WHERE id=o.service_request_id AND status<>'PAID';
   SELECT email INTO recipient_email FROM service_requests WHERE id=o.service_request_id;
  ELSE SELECT email INTO recipient_email FROM fighters WHERE id=o.fighter_id; END IF;
  INSERT INTO notification_outbox(dedupe_key,recipient,subject,body) VALUES('paid-'||o.id,recipient_email,'Punch Mentality — payment received',concat('Payment received: ',o.amount/100.0,' USD. Order: ',o.id,E'\nYour agreed order details:\n',o.terms_snapshot,E'\nSparring participation and pairing are reviewed independently of content purchases.')) ON CONFLICT(dedupe_key) DO NOTHING;
 ELSIF p_state='FAILED' AND o.payment_status='PENDING' THEN UPDATE orders SET payment_status='FAILED' WHERE id=o.id;
 ELSIF p_state='REFUNDED' THEN
  IF p_refunded<0 OR p_refunded>o.amount OR o.payment_status NOT IN ('PAID','REFUNDED') THEN RAISE EXCEPTION 'Invalid refund'; END IF;
  UPDATE orders SET amount_refunded=greatest(amount_refunded,p_refunded),payment_status=CASE WHEN p_refunded>=amount THEN 'REFUNDED' ELSE payment_status END WHERE id=o.id;
 END IF;
 INSERT INTO stripe_events(id) VALUES(p_event) ON CONFLICT DO NOTHING;
 RETURN true;
END $$;
