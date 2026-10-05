-- Server-only application schema. No anonymous/authenticated table access.
create table public.fighters (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
 first_name text not null, last_name text not null, display_name text not null, date_of_birth date not null,
 age integer not null check(age between 0 and 120), email text not null, phone text not null,
 instagram text not null default '', city text not null, gym text not null, height numeric not null check(height>0),
 current_weight numeric not null check(current_weight>0), stance text not null,
 years_boxing numeric not null check(years_boxing>=0), amateur_fights integer not null check(amateur_fights>=0),
 professional_fights integer not null check(professional_fights>=0), competition_experience text not null,
 sparring_experience text not null, skill_level text not null, profile_photo_url text,
 video_url text, notes text not null default '', public_slug text unique not null,
 emergency_name text not null, emergency_phone text not null,
 visibility text not null check(visibility in ('PUBLIC','PRIVATE')), profile_published boolean not null default false
);
create table public.sessions (
 id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null,
 date date not null, start_time time not null, timezone text not null default 'America/Los_Angeles',
 location_name text not null, city text not null, protected_location_field text not null default '',
 status text not null default 'UPCOMING' check(status in ('UPCOMING','COMPLETED','CANCELLED')),
 description text not null default '', is_public boolean not null default false
);
create table public.applications (
 id uuid primary key default gen_random_uuid(), request_id uuid unique not null, fighter_id uuid not null references public.fighters(id),
 session_id uuid references public.sessions(id), created_at timestamptz not null default now(),
 availability text not null, preferred_intensity text not null, additional_notes text not null default '',
 application_status text not null default 'NEW' check(application_status in ('NEW','REVIEWING','WAITLIST','MATCHED','CONFIRMED','COMPLETED','DECLINED','CANCELLED')),
 media_consent boolean not null, rules_accepted boolean not null check(rules_accepted),
 accuracy_accepted boolean not null check(accuracy_accepted), no_guarantee_accepted boolean not null check(no_guarantee_accepted), recording_accepted boolean not null check(recording_accepted),
 terms_version text not null, accepted_at timestamptz not null default now(), guardian_required boolean not null,
 guardian_name text, guardian_contact text, guardian_reviewed_at timestamptz, guardian_reviewed_by uuid, guardian_review_notes text,
 internal_notes text not null default ''
);
create table public.matchups (
 id uuid primary key default gen_random_uuid(), session_id uuid not null references public.sessions(id),
 fighter_a_id uuid not null references public.fighters(id), fighter_b_id uuid not null references public.fighters(id),
 application_a_id uuid not null references public.applications(id), application_b_id uuid not null references public.applications(id),
 created_at timestamptz not null default now(), status text not null default 'PROPOSED' check(status in ('PROPOSED','AWAITING_CONFIRMATION','CONFIRMED','COMPLETED','CANCELLED')),
 rounds integer not null check(rounds between 1 and 12), round_length integer not null check(round_length in (60,90,120,180)),
 internal_notes text not null default '', published boolean not null default false,
 check(fighter_a_id<>fighter_b_id)
);
create table public.fighter_matchup_confirmations (
 matchup_id uuid not null references public.matchups(id), fighter_id uuid not null references public.fighters(id),
 token_hash text unique not null, expires_at timestamptz not null,
 status text not null default 'PENDING' check(status in ('PENDING','CONFIRMED','DECLINED')),
 confirmed_at timestamptz, primary key(matchup_id,fighter_id)
);
create table public.orders (
 id uuid primary key default gen_random_uuid(), fighter_id uuid not null references public.fighters(id), matchup_id uuid not null references public.matchups(id),
 stripe_checkout_session_id text unique, stripe_payment_intent_id text unique, amount integer not null default 9900 check(amount=9900),
 currency text not null default 'usd' check(currency='usd'), product_type text not null default 'CONTENT_PACK' check(product_type='CONTENT_PACK'),
 payment_status text not null default 'PENDING' check(payment_status in ('PENDING','PAID','FAILED','REFUNDED')),
 created_at timestamptz not null default now(), paid_at timestamptz, amount_refunded integer not null default 0,
 attempt integer not null default 1, checkout_expires_at timestamptz,
 content_status text not null default 'NOT_STARTED' check(content_status in ('NOT_STARTED','EDITING','DELIVERED')),
 unique(fighter_id,matchup_id,product_type)
);
create table public.media (
 id uuid primary key default gen_random_uuid(), matchup_id uuid not null references public.matchups(id),
 fighter_id uuid references public.fighters(id), title text not null, kind text not null check(kind in ('FULL_ROUNDS','HIGHLIGHT','SOCIAL_REEL')),
 url text not null, published boolean not null default false, created_at timestamptz not null default now()
);
create table public.notification_outbox (
 id uuid primary key default gen_random_uuid(), dedupe_key text unique not null, recipient text not null,
 subject text not null, body text not null, created_at timestamptz not null default now(), sent_at timestamptz,
 attempts integer not null default 0, last_error text
);
create table public.stripe_events (id text primary key, created_at timestamptz not null default now());
create table public.rate_limits (key text primary key, hits integer not null, resets_at timestamptz not null);
create table public.audit_log (id uuid primary key default gen_random_uuid(), actor uuid, action text not null, entity_id uuid, created_at timestamptz not null default now());
create index applications_created on public.applications(created_at desc);
create index confirmations_expiry on public.fighter_matchup_confirmations(expires_at);
create index outbox_pending on public.notification_outbox(created_at) where sent_at is null;

create function public.take_rate_limit(p_key text, p_limit integer, p_seconds integer) returns boolean language plpgsql set search_path=public as $$
declare n integer;
begin
 insert into rate_limits values(p_key,1,now()+make_interval(secs=>p_seconds))
 on conflict(key) do update set hits=case when rate_limits.resets_at<now() then 1 else rate_limits.hits+1 end,
 resets_at=case when rate_limits.resets_at<now() then now()+make_interval(secs=>p_seconds) else rate_limits.resets_at end returning hits into n;
 return n<=p_limit;
end $$;

create function public.submit_application(p_data jsonb,p_request_id uuid,p_admin_email text,p_origin text) returns uuid language plpgsql set search_path=public as $$
declare fid uuid; aid uuid; years integer; sid uuid;
begin
 perform pg_advisory_xact_lock(hashtext(p_request_id::text));
 select id into aid from applications where request_id=p_request_id;
 if aid is not null then return aid; end if;
 years:=extract(year from age(current_date,(p_data->>'date_of_birth')::date));
 sid:=nullif(p_data->>'session_id','')::uuid;
 if sid is not null and not exists(select 1 from sessions where id=sid and is_public and status='UPCOMING' and date>=current_date) then raise exception 'Session is not accepting applications'; end if;
 insert into fighters(first_name,last_name,display_name,date_of_birth,age,email,phone,instagram,city,gym,height,current_weight,stance,years_boxing,amateur_fights,professional_fights,competition_experience,sparring_experience,skill_level,video_url,notes,public_slug,emergency_name,emergency_phone,visibility)
 values(p_data->>'first_name',p_data->>'last_name',p_data->>'display_name',(p_data->>'date_of_birth')::date,years,p_data->>'email',p_data->>'phone',p_data->>'instagram',p_data->>'city',p_data->>'gym',(p_data->>'height')::numeric,(p_data->>'current_weight')::numeric,p_data->>'stance',(p_data->>'years_boxing')::numeric,(p_data->>'amateur_fights')::integer,(p_data->>'professional_fights')::integer,p_data->>'competition_experience',p_data->>'sparring_experience',p_data->>'skill_level',p_data->>'video_url',p_data->>'notes','fighter-'||gen_random_uuid()::text,p_data->>'emergency_name',p_data->>'emergency_phone',case when years<18 then 'PRIVATE' else p_data->>'visibility' end) returning id into fid;
 insert into applications(request_id,fighter_id,session_id,availability,preferred_intensity,additional_notes,media_consent,rules_accepted,accuracy_accepted,no_guarantee_accepted,recording_accepted,terms_version,guardian_required,guardian_name,guardian_contact)
 values(p_request_id,fid,sid,p_data->>'availability',p_data->>'preferred_intensity',p_data->>'notes',years>=18 and (p_data->>'media_consent')::boolean,(p_data->>'rules_accepted')::boolean,(p_data->>'accuracy_accepted')::boolean,(p_data->>'no_guarantee_accepted')::boolean,(p_data->>'recording_accepted')::boolean,p_data->>'terms_version',years<18,p_data->>'guardian_name',p_data->>'guardian_contact') returning id into aid;
 insert into notification_outbox(dedupe_key,recipient,subject,body) values('application-'||aid,p_admin_email,'New Punch application',concat(p_data->>'display_name',E'\nAge: ',years,E'\nWeight (lb): ',p_data->>'current_weight',E'\nExperience: ',p_data->>'skill_level',E'\nStance: ',p_data->>'stance',E'\nGym: ',p_data->>'gym',E'\nInstagram: ',p_data->>'instagram',E'\nReview: ',p_origin,'/admin/applications/',aid));
 return aid;
end $$;

create function public.create_matchup(p_a uuid,p_b uuid,p_session uuid,p_rounds integer,p_length integer,p_notes text,p_hash_a text,p_hash_b text,p_link_a text,p_link_b text,p_actor uuid) returns uuid language plpgsql set search_path=public as $$
declare a applications; b applications; mid uuid; s sessions;
begin
 if p_a=p_b then raise exception 'Choose two different applications'; end if;
 perform id from applications where id in(p_a,p_b) order by id for update;
 select * into a from applications where id=p_a; select * into b from applications where id=p_b;
 if a.id is null or b.id is null or a.fighter_id=b.fighter_id then raise exception 'Choose two different fighters'; end if;
 if a.application_status not in ('NEW','REVIEWING','WAITLIST') or b.application_status not in ('NEW','REVIEWING','WAITLIST') then raise exception 'Application is not eligible for matching'; end if;
 if (a.guardian_required and a.guardian_reviewed_at is null) or (b.guardian_required and b.guardian_reviewed_at is null) then raise exception 'Guardian review must be completed first'; end if;
 select * into s from sessions where id=p_session for update;
 if s.id is null or s.status<>'UPCOMING' or s.date<current_date then raise exception 'Choose an upcoming session'; end if;
 if (a.session_id is not null and a.session_id<>s.id) or (b.session_id is not null and b.session_id<>s.id) then raise exception 'Requested session does not match'; end if;
 insert into matchups(session_id,fighter_a_id,fighter_b_id,application_a_id,application_b_id,rounds,round_length,internal_notes,status) values(p_session,a.fighter_id,b.fighter_id,p_a,p_b,p_rounds,p_length,p_notes,'AWAITING_CONFIRMATION') returning id into mid;
 insert into fighter_matchup_confirmations(matchup_id,fighter_id,token_hash,expires_at) values(mid,a.fighter_id,p_hash_a,now()+interval '14 days'),(mid,b.fighter_id,p_hash_b,now()+interval '14 days');
 update applications set application_status='MATCHED',session_id=p_session where id in(p_a,p_b);
 insert into notification_outbox(dedupe_key,recipient,subject,body) select 'match-'||mid||'-'||id,email,'You have been matched — Punch Mentality',concat('Your invitation to ',s.title,E'.\nReview the session and confirm your spot: ',case when id=a.fighter_id then p_link_a else p_link_b end,E'\nSparring is free. Content is optional. This private link expires in 14 days.') from fighters where id in(a.fighter_id,b.fighter_id);
 insert into audit_log(actor,action,entity_id) values(p_actor,'CREATE_MATCHUP',mid);
 return mid;
end $$;

create function public.respond_matchup(p_hash text,p_accept boolean) returns text language plpgsql set search_path=public as $$
declare c fighter_matchup_confirmations; m matchups; n integer;
begin
 select * into c from fighter_matchup_confirmations where token_hash=p_hash and expires_at>now();
 if c.matchup_id is null then raise exception 'Invitation is invalid or expired'; end if;
 select * into m from matchups where id=c.matchup_id for update;
 select * into c from fighter_matchup_confirmations where token_hash=p_hash;
 if m.status not in ('AWAITING_CONFIRMATION','CONFIRMED') then raise exception 'This matchup is no longer open'; end if;
 if not exists(select 1 from sessions where id=m.session_id and status='UPCOMING' and date>=current_date) then raise exception 'Session is no longer open'; end if;
 if c.status='DECLINED' then raise exception 'This invitation was declined'; end if;
 update fighter_matchup_confirmations set status=case when p_accept then 'CONFIRMED' else 'DECLINED' end,confirmed_at=case when p_accept then coalesce(confirmed_at,now()) else null end where token_hash=p_hash;
 if not p_accept then
  update matchups set status='CANCELLED',published=false where id=m.id;
  update applications set application_status=case when fighter_id=c.fighter_id then 'CANCELLED' else 'WAITLIST' end where id in(m.application_a_id,m.application_b_id);
  return 'CANCELLED';
 end if;
 update applications set application_status='CONFIRMED' where id in(m.application_a_id,m.application_b_id) and fighter_id=c.fighter_id;
 select count(*) into n from fighter_matchup_confirmations where matchup_id=m.id and status='CONFIRMED';
 if n=2 then update matchups set status='CONFIRMED' where id=m.id; return 'CONFIRMED'; end if;
 return 'AWAITING_CONFIRMATION';
end $$;

create function public.reserve_order(p_matchup uuid,p_fighter uuid) returns public.orders language plpgsql set search_path=public as $$
declare m matchups; o orders;
begin
 select * into m from matchups where id=p_matchup for update;
 if m.status<>'CONFIRMED' or p_fighter not in(m.fighter_a_id,m.fighter_b_id) or not exists(select 1 from sessions where id=m.session_id and status='UPCOMING' and date>=current_date) then raise exception 'Both fighters must be confirmed for an upcoming session'; end if;
 insert into orders(fighter_id,matchup_id) values(p_fighter,p_matchup) on conflict(fighter_id,matchup_id,product_type) do nothing;
 select * into o from orders where fighter_id=p_fighter and matchup_id=p_matchup for update;
 if o.payment_status in ('PAID','REFUNDED') then raise exception 'This content pack has already been purchased'; end if;
 -- An existing live Checkout is reused. Expired sessions are marked FAILED by a verified event/retrieval before retry.
 if o.payment_status='FAILED' then update orders set payment_status='PENDING',attempt=attempt+1,stripe_checkout_session_id=null,checkout_expires_at=null where id=o.id returning * into o; end if;
 return o;
end $$;

create function public.record_payment(p_event text,p_order uuid,p_checkout text,p_intent text,p_state text,p_amount integer,p_currency text,p_refunded integer default 0) returns boolean language plpgsql set search_path=public as $$
declare o orders; recipient_email text;
begin
 select * into o from orders where id=p_order for update;
 if o.id is null then raise exception 'Unknown order'; end if;
 if exists(select 1 from stripe_events where id=p_event) then return false; end if;
 if p_amount<>o.amount or p_currency<>o.currency then raise exception 'Payment amount mismatch'; end if;
 if o.stripe_checkout_session_id is not null and p_checkout is distinct from o.stripe_checkout_session_id then raise exception 'Checkout mismatch'; end if;
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

create function public.manage_matchup(p_id uuid,p_action text,p_actor uuid) returns void language plpgsql set search_path=public as $$
declare m matchups;
begin
 select * into m from matchups where id=p_id for update;
 if m.id is null then raise exception 'Matchup not found'; end if;
 if p_action='COMPLETE' then
  if m.status<>'CONFIRMED' then raise exception 'Only confirmed matchups can be completed'; end if;
  update matchups set status='COMPLETED' where id=p_id;
  update applications set application_status='COMPLETED' where id in(m.application_a_id,m.application_b_id);
 elsif p_action='CANCEL' then
  if m.status='COMPLETED' then raise exception 'Completed sessions cannot be cancelled'; end if;
  update matchups set status='CANCELLED',published=false where id=p_id;
  update applications set application_status='CANCELLED' where id in(m.application_a_id,m.application_b_id);
 elsif p_action='PUBLISH' then
  if m.status<>'COMPLETED' or exists(select 1 from applications a join fighters f on f.id=a.fighter_id where a.id in(m.application_a_id,m.application_b_id) and (not a.media_consent or a.guardian_required or f.visibility<>'PUBLIC')) then raise exception 'Publication requires completed rounds and public consent from both adults'; end if;
  update matchups set published=true where id=p_id;
 else raise exception 'Unknown action'; end if;
 insert into audit_log(actor,action,entity_id) values(p_actor,p_action,p_id);
end $$;


create table public.subscribers (
 id uuid primary key default gen_random_uuid(), first_name text not null,
 email text unique not null, created_at timestamptz not null default now(),
 consent_version text not null, subscribed boolean not null default true
);
create function public.subscribe_updates(p_name text,p_email text,p_admin_email text,p_origin text) returns void language plpgsql set search_path=public as $$
declare sid uuid;
begin
 insert into subscribers(first_name,email,consent_version) values(p_name,lower(p_email),'updates-2026-10-02') on conflict(email) do nothing returning id into sid;
 if sid is not null then
  insert into notification_outbox(dedupe_key,recipient,subject,body) values('subscriber-'||sid,p_admin_email,'New Punch updates subscriber',concat('Name: ',p_name,E'\nEmail: ',lower(p_email),E'\nView subscribers: ',p_origin,'/admin'));
 end if;
end $$;
