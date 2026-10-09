ALTER TABLE matchups ADD COLUMN content_terms text NOT NULL DEFAULT '';
ALTER TABLE matchups ADD COLUMN content_terms_version integer NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN terms_snapshot text;
ALTER TABLE orders ADD COLUMN terms_accepted_at timestamptz;
CREATE FUNCTION reserve_content_order(p_matchup uuid,p_fighter uuid,p_terms_version integer) RETURNS orders LANGUAGE plpgsql SET search_path=public AS $$
DECLARE m matchups; o orders;
BEGIN
 SELECT * INTO m FROM matchups WHERE id=p_matchup FOR UPDATE;
 IF m.id IS NULL OR length(trim(m.content_terms))<30 OR m.content_terms_version<>p_terms_version THEN RAISE EXCEPTION 'Order details need confirmation'; END IF;
 SELECT * INTO o FROM reserve_order(p_matchup,p_fighter);
 UPDATE orders SET terms_snapshot=coalesce(terms_snapshot,m.content_terms),terms_accepted_at=coalesce(terms_accepted_at,now()) WHERE id=o.id RETURNING * INTO o;
 RETURN o;
END $$;
GRANT EXECUTE ON FUNCTION reserve_content_order(uuid,uuid,integer) TO rung_app;
create or replace function public.record_payment(p_event text,p_order uuid,p_checkout text,p_intent text,p_state text,p_amount integer,p_currency text,p_refunded integer default 0) returns boolean language plpgsql set search_path=public as $$
declare o orders; recipient_email text;
begin
 select * into o from orders where id=p_order for update;
 if o.id is null then raise exception 'Unknown order'; end if;
 if exists(select 1 from stripe_events where id=p_event) then return false; end if;
 if p_amount IS DISTINCT FROM o.amount or p_currency IS DISTINCT FROM o.currency then raise exception 'Payment amount mismatch'; end if;
 if o.stripe_checkout_session_id is null or p_checkout is distinct from o.stripe_checkout_session_id then raise exception 'Checkout mismatch'; end if;
 if p_state='PAID' and o.payment_status<>'REFUNDED' then
  update orders set payment_status='PAID',stripe_checkout_session_id=p_checkout,stripe_payment_intent_id=p_intent,paid_at=coalesce(paid_at,now()) where id=o.id;
  select email into recipient_email from fighters where id=o.fighter_id;
  insert into notification_outbox(dedupe_key,recipient,subject,body) values('paid-'||o.id,recipient_email,'Punch Content Pack — payment received','Your $99 Punch Content Pack payment has been received. Your participation is confirmed independently of this purchase. Keep your session confirmation link for your order status.') on conflict(dedupe_key) do nothing;
 elsif p_state='FAILED' and o.payment_status='PENDING' then update orders set payment_status='FAILED' where id=o.id;
 elsif p_state='REFUNDED' then
  update orders set amount_refunded=greatest(amount_refunded,p_refunded),payment_status=case when p_refunded>=amount then 'REFUNDED' else payment_status end where id=o.id;
 end if;
 insert into stripe_events(id) values(p_event) on conflict do nothing;
 return true;
end $$;

