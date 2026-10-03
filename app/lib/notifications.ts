import 'server-only';
import {db,env,result} from './server';
export async function flushNotifications(){
 if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM)return {sent:0,pending:true};
 const rows=result(await db().from('notification_outbox').select('*').is('sent_at',null).lt('attempts',10).order('created_at').limit(20));
 let sent=0;
 for(const row of rows){
  try{
   const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env('RESEND_API_KEY')}`,'Content-Type':'application/json','Idempotency-Key':row.dedupe_key},body:JSON.stringify({from:env('EMAIL_FROM'),to:row.recipient,subject:row.subject,text:row.body}),signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw new Error('Email provider rejected request');
   const {error}=await db().from('notification_outbox').update({sent_at:new Date().toISOString(),attempts:row.attempts+1,last_error:null}).eq('id',row.id);
   if(error)throw new Error('Could not acknowledge delivery');sent++;
  }catch{await db().from('notification_outbox').update({attempts:row.attempts+1,last_error:'Delivery failed. Check provider settings, then retry.'}).eq('id',row.id);}
 }
 return {sent};
}
