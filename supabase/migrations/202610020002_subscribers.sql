create table public.subscribers (
 id uuid primary key default gen_random_uuid(), first_name text not null,
 email text unique not null, created_at timestamptz not null default now(),
 consent_version text not null, subscribed boolean not null default true
);
alter table public.subscribers enable row level security;
revoke all on public.subscribers from anon, authenticated;
grant all on public.subscribers to service_role;
create function public.subscribe_updates(p_name text,p_email text,p_admin_email text,p_origin text) returns void language plpgsql set search_path=public as $$
declare sid uuid;
begin
 insert into subscribers(first_name,email,consent_version) values(p_name,lower(p_email),'updates-2026-10-02') on conflict(email) do nothing returning id into sid;
 if sid is not null then
  insert into notification_outbox(dedupe_key,recipient,subject,body) values('subscriber-'||sid,p_admin_email,'New Punch updates subscriber',concat('Name: ',p_name,E'\nEmail: ',lower(p_email),E'\nView subscribers: ',p_origin,'/admin'));
 end if;
end $$;
revoke all on function public.subscribe_updates(text,text,text,text) from public,anon,authenticated;
grant execute on function public.subscribe_updates(text,text,text,text) to service_role;
