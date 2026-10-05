import 'server-only';
import {sql} from './postgres';
export async function flushNotifications(){
 if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM)return {sent:0,pending:true};
 const c=await sql().connect();let sent=0;
 try{const lock=await c.query('SELECT pg_try_advisory_lock(92835171) AS acquired');if(!lock.rows[0].acquired)return {sent:0,busy:true};
 const {rows}=await c.query('SELECT * FROM notification_outbox WHERE sent_at IS NULL AND attempts<10 AND next_attempt_at<=now() ORDER BY created_at LIMIT 10');
 for(const row of rows){try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':row.dedupe_key},body:JSON.stringify({from:process.env.EMAIL_FROM,to:row.recipient,subject:row.subject,text:row.body}),signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('Provider rejected request');const data=await response.json();await c.query('UPDATE notification_outbox SET sent_at=now(),provider_id=$2,attempts=attempts+1,last_error=NULL WHERE id=$1',[row.id,data.id]);sent++;}catch{await c.query("UPDATE notification_outbox SET attempts=attempts+1,next_attempt_at=now()+make_interval(secs=>$2),last_error='Delivery failed; queued for retry.' WHERE id=$1",[row.id,Math.min(3600,60*2**row.attempts)]);}}
 return {sent};}finally{await c.query('SELECT pg_advisory_unlock(92835171)');c.release();}
}
