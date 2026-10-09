import {after} from 'next/server';
import {leadSchema} from '../../lib/validation';
import {body,env,failure,hash,HttpError,liveReady,rate} from '../../lib/server';
import {transaction} from '../../lib/postgres';
import {flushNotifications} from '../../lib/notifications';
export async function POST(req:Request){try{
 if(!liveReady())throw new HttpError(503,'Registration is temporarily unavailable. Please try again soon.');
 await rate(req,'lead',20);const d=leadSchema.parse(await body(req));
 await transaction(async c=>{
  await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[d.request_id]);
  const old=await c.query('SELECT token_hash,application_id FROM application_leads WHERE request_id=$1',[d.request_id]);
  if(old.rows[0]&&old.rows[0].token_hash!==hash(d.lead_token))throw new HttpError(403,'Unable to update this registration.');
  if(old.rows[0]?.application_id)throw new HttpError(409,'This application has already been submitted.');
  await c.query(`INSERT INTO application_leads(request_id,token_hash,first_name,email,phone,date_of_birth,marketing_consent,consent_version,source,boxing)
  VALUES($1,$2,$3,$4,$5,$6,$7,'updates-2026-10-09',$8,$9)
  ON CONFLICT(request_id) DO UPDATE SET first_name=EXCLUDED.first_name,email=EXCLUDED.email,phone=EXCLUDED.phone,date_of_birth=EXCLUDED.date_of_birth,marketing_consent=EXCLUDED.marketing_consent,boxing=COALESCE(EXCLUDED.boxing,application_leads.boxing),updated_at=now()`,[d.request_id,hash(d.lead_token),d.first_name,d.email,d.phone,d.date_of_birth,d.marketing_consent,d.source,d.boxing||null]);
  if(d.marketing_consent)await c.query('SELECT subscribe_updates($1,$2,$3,$4)',[d.first_name,d.email,env('ADMIN_NOTIFICATION_EMAIL'),env('ADMIN_URL')]);
  await c.query(`INSERT INTO notification_outbox(dedupe_key,recipient,subject,body) VALUES($1,$2,$3,$4) ON CONFLICT(dedupe_key) DO NOTHING`,['lead-'+d.request_id,env('ADMIN_NOTIFICATION_EMAIL'),'New Punch contact — application started',d.first_name+' started an application. Review securely: '+env('ADMIN_URL')+'/admin#leads']);
 });after(flushNotifications);return Response.json({saved:true});
}catch(e){return failure(e);}}
