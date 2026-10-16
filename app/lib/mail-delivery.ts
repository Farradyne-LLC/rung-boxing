import type {Pool} from 'pg';
export type MailEnv=Record<string,string|undefined>;
export const reservedRecipient=(email:string)=>/(^|\.)(example\.(com|net|org)|invalid|test|localhost)$/.test(email.split('@').pop()?.toLowerCase()||'');
export async function deliverMail(pool:Pool,env:MailEnv,provider:typeof fetch=fetch){
 const c=await pool.connect();let locked=false,sent=0;
 try{
  locked=(await c.query('SELECT pg_try_advisory_lock(92835171) AS acquired')).rows[0].acquired;
  if(!locked)return {sent:0,busy:true};
  if(env.SITE_PREVIEW!=='true')await c.query("UPDATE notification_outbox SET delivery_state='failed_permanent',last_error='Reserved test domain is not deliverable in production.' WHERE sent_at IS NULL AND delivery_state<>'failed_permanent' AND reserved_mail_recipient(recipient)");
  if(!env.RESEND_API_KEY||!env.EMAIL_FROM)return {sent:0,pending:true};
  const rows=(await c.query("SELECT * FROM notification_outbox WHERE sent_at IS NULL AND delivery_state IN ('queued','failed_transient') AND next_attempt_at<=now() AND ($1::boolean=false OR lower(recipient)=lower($2)) ORDER BY created_at LIMIT 10",[env.SITE_PREVIEW==='true',env.MAIL_TEST_RECIPIENT||''])).rows;
  for(const row of rows){
   if(env.SITE_PREVIEW==='true'&&(!env.MAIL_TEST_RECIPIENT||row.recipient.toLowerCase()!==env.MAIL_TEST_RECIPIENT.toLowerCase()))continue;
   let status:number|null=null;
   try{
    const r=await provider('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':row.dedupe_key},body:JSON.stringify({from:env.EMAIL_FROM,to:row.recipient,subject:row.subject,text:row.body}),signal:AbortSignal.timeout(10000)});status=r.status;
    if(!r.ok)throw new Error('Provider failure');
    const data=await r.json();if(typeof data.id!=='string')throw new Error('Invalid provider response');
    await c.query("UPDATE notification_outbox SET delivery_state='sent',sent_at=now(),provider_id=$2,provider_status=$3,attempts=attempts+1,last_error=NULL WHERE id=$1",[row.id,data.id,status]);sent++;
   }catch{
    const permanent=status!==null&&status>=400&&status<500&&status!==429;
    await c.query('UPDATE notification_outbox SET delivery_state=$2,provider_status=$3,attempts=attempts+1,next_attempt_at=now()+make_interval(secs=>$4),last_error=$5 WHERE id=$1',[row.id,permanent?'failed_permanent':'failed_transient',status,Math.min(3600,60*2**Math.min(row.attempts,6)),permanent?'Provider rejected delivery. Administrator review required.':'Temporary delivery failure; retry scheduled.']);
   }
  }
  return {sent};
 }finally{if(locked)await c.query('SELECT pg_advisory_unlock(92835171)');c.release();}
}
export async function queueDailyDigests(pool:Pool,env:MailEnv){
 if(!env.ADMIN_NOTIFICATION_EMAIL)return;
 const c=await pool.connect();try{
  const day=(await c.query("SELECT to_char(now() AT TIME ZONE 'America/Los_Angeles','YYYY-MM-DD') AS day")).rows[0].day;
  const hours=Math.max(1,Number(env.MAIL_ALERT_HOURS)||4);
  const mail=(await c.query("SELECT count(*)::int AS n FROM notification_outbox WHERE dedupe_key NOT LIKE 'mail-alert-%' AND (delivery_state='failed_permanent' OR (delivery_state IN ('queued','failed_transient') AND created_at<now()-make_interval(hours=>$1)))",[hours])).rows[0].n;
  if(mail)await c.query('INSERT INTO notification_outbox(dedupe_key,recipient,subject,body) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',['mail-alert-'+day,env.ADMIN_NOTIFICATION_EMAIL,'Punch — email delivery needs attention',`${mail} messages need review. ${env.ADMIN_URL}/admin/email`]);
  const apps=(await c.query("SELECT f.first_name,f.last_name FROM applications a JOIN fighters f ON f.id=a.fighter_id WHERE a.application_status='NEW' AND a.created_at<now()-interval '24 hours' ORDER BY a.created_at")).rows;
  if(apps.length)await c.query('INSERT INTO notification_outbox(dedupe_key,recipient,subject,body) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',['application-digest-'+day,env.ADMIN_NOTIFICATION_EMAIL,'Punch — applications waiting for review',`${apps.length} applications older than 24 hours:\n${apps.map(a=>a.first_name+' '+a.last_name).join('\n')}\n${env.ADMIN_URL}/admin?status=NEW`]);
 }finally{c.release();}
}
