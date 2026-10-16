import 'server-only';
import {z} from 'zod';
import {transaction} from './postgres';
import {hash,HttpError,newToken,origin} from './server';
import {reservedRecipient} from './mail-delivery';
export async function v5Admin(action:string,input:unknown,user:{id:string;email:string}){
 return transaction(async c=>{
  let id:string,changes:unknown;
  if(action==='RETRY_EMAIL'){
   const d=z.object({id:z.uuid()}).parse(input);id=d.id;
   const row=(await c.query('SELECT * FROM notification_outbox WHERE id=$1 FOR UPDATE',[id])).rows[0];
   if(!row||row.delivery_state!=='failed_permanent')throw new HttpError(409,'Only permanently failed messages can be retried here.');
   if(process.env.SITE_PREVIEW!=='true'&&reservedRecipient(row.recipient))throw new HttpError(400,'Reserved test addresses cannot receive production mail.');
   await c.query("UPDATE notification_outbox SET delivery_state='queued',next_attempt_at=now(),last_error=NULL WHERE id=$1",[id]);changes={from:row.delivery_state,to:'queued',attempts:row.attempts};
  }else if(action==='CONTACTED'){
   const d=z.object({id:z.uuid()}).parse(input);id=d.id;
   const row=(await c.query('SELECT * FROM applications WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!row)throw new HttpError(404,'Application not found.');
   await c.query("UPDATE applications SET contacted_at=now(),contacted_by=$2,application_status=CASE WHEN application_status='NEW' THEN 'REVIEWING' ELSE application_status END WHERE id=$1",[id,user.id]);changes={before:row.application_status,contacted:true};
  }else if(action==='ATTACH_PREPAID'){
   const d=z.object({id:z.uuid(),matchup_id:z.uuid()}).parse(input);id=d.id;
   const m=(await c.query('SELECT * FROM matchups WHERE id=$1 FOR UPDATE',[d.matchup_id])).rows[0];
   const o=(await c.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE',[id])).rows[0];
   if(!m||!o||o.product_type!=='CONTENT_PACK_PREPAID'||o.matchup_id||o.payment_status!=='PAID'||o.content_status!=='AWAITING_SESSION'||![m.fighter_a_id,m.fighter_b_id].includes(o.fighter_id)||m.status!=='CONFIRMED'||!m.organizer_confirmed_at)throw new HttpError(409,'Select a confirmed pair containing the prepaid fighter.');
   const existing=await c.query("SELECT 1 FROM orders WHERE matchup_id=$1 AND fighter_id=$2 AND product_type IN ('CONTENT_PACK','CONTENT_PACK_PREPAID')",[m.id,o.fighter_id]);if(existing.rowCount)throw new HttpError(409,'This pair already has a Content Pack order. Resolve it before attaching prepayment.');
   await c.query("UPDATE orders SET matchup_id=$2,content_status='NOT_STARTED' WHERE id=$1",[id,m.id]);changes={before:{matchup_id:null,content_status:o.content_status},after:{matchup_id:m.id,content_status:'NOT_STARTED'}};
  }else if(action==='SERVICE_QUOTE'){
   const d=z.object({id:z.uuid(),version:z.coerce.number().int(),quote_amount_cents:z.coerce.number().int().min(50).max(10000000),quote_terms:z.string().trim().min(30).max(5000)}).parse(input);id=d.id;
   const s=(await c.query('SELECT * FROM service_requests WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!s||s.version!==d.version)throw new HttpError(409,'Request changed. Reload before quoting.');
   if((await c.query('SELECT 1 FROM orders WHERE service_request_id=$1',[id])).rowCount)throw new HttpError(409,'An order already exists. Do not change its accepted quote.');
   const token=newToken();
   await c.query("UPDATE service_requests SET quote_amount_cents=$2,quote_currency='usd',quote_terms=$3,quote_version=quote_version+1,quoted_at=now(),quoted_by=$4,payment_token_hash=$5,payment_expires_at=now()+interval '14 days',status='QUOTED',version=version+1,updated_at=now() WHERE id=$1",[id,d.quote_amount_cents,d.quote_terms,user.id,hash(token)]);
   await c.query('INSERT INTO notification_outbox(dedupe_key,recipient,subject,body) VALUES($1,$2,$3,$4)',['service-quote-'+id+'-'+(s.quote_version+1),s.email,'Punch Mentality — your service quote',`Review your ${s.kind.replaceAll('_',' ').toLowerCase()} quote for $${(d.quote_amount_cents/100).toFixed(2)} USD:\n${origin()}/pay/service/${token}\nPrivate link, valid for 14 days.\n${d.quote_terms}`]);
   changes={before:{amount:s.quote_amount_cents,terms:s.quote_terms},after:{amount:d.quote_amount_cents,currency:'usd',terms:d.quote_terms}};
  }else throw new HttpError(400,'Unknown operation.');
  await c.query('INSERT INTO audit_log(actor,actor_label,action,entity_id,changes) VALUES($1,$2,$3,$4,$5)',[user.id,user.email,action,id,changes]);return {ok:true};
 });
}
