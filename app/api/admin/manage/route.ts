import {after} from 'next/server';
import {z} from 'zod';
import {admin,body,db,failure,hash,newToken,origin,result,HttpError} from '../../../lib/server';
import {matchupSchema,sessionSchema,safeUrl} from '../../../lib/validation';
import {flushNotifications} from '../../../lib/notifications';
export async function POST(req:Request){try{
 const user=await admin();const input=await body(req);const action=z.string().parse(input.action);let value:unknown={ok:true};
 if(action==='SESSION')value=result(await db().from('sessions').insert(sessionSchema.parse(input.data)).select('id').single());
 else if(action==='MATCHUP'){
  const d=matchupSchema.parse(input.data);const ta=newToken(),tb=newToken();
  const r=await db().rpc('create_matchup',{p_a:d.application_a_id,p_b:d.application_b_id,p_session:d.session_id,p_rounds:d.rounds,p_length:d.round_length,p_notes:d.internal_notes,p_hash_a:hash(ta),p_hash_b:hash(tb),p_link_a:`${origin()}/match/${ta}`,p_link_b:`${origin()}/match/${tb}`,p_actor:user.id});
  if(r.error)throw new HttpError(409,r.error.message.includes('Guardian')?'Complete guardian review before matching.':'These applications cannot be matched. Check status and requested session.');
  value={id:r.data,link_a:`${origin()}/match/${ta}`,link_b:`${origin()}/match/${tb}`};after(flushNotifications);
 }else if(action==='APPLICATION'){
  const d=z.object({id:z.uuid(),application_status:z.enum(['NEW','REVIEWING','WAITLIST','DECLINED','CANCELLED']),internal_notes:z.string().max(5000)}).parse(input.data);
  const row=result(await db().from('applications').select('application_status').eq('id',d.id).single());
  if(['MATCHED','CONFIRMED','COMPLETED'].includes(row.application_status))throw new HttpError(409,'Manage the associated matchup to change this status.');
  result(await db().from('applications').update({application_status:d.application_status,internal_notes:d.internal_notes}).eq('id',d.id).in('application_status',['NEW','REVIEWING','WAITLIST','DECLINED','CANCELLED']).select('id').single());
 }else if(action==='NOTES'){
  const d=z.object({id:z.uuid(),internal_notes:z.string().max(5000)}).parse(input.data);result(await db().from('applications').update({internal_notes:d.internal_notes}).eq('id',d.id).select('id').single());
 }else if(action==='GUARDIAN'){
  const d=z.object({id:z.uuid(),notes:z.string().trim().min(15).max(3000)}).parse(input.data);
  result(await db().from('applications').update({guardian_reviewed_at:new Date().toISOString(),guardian_reviewed_by:user.id,guardian_review_notes:d.notes}).eq('id',d.id).eq('guardian_required',true).select('id').single());
 }else if(action==='MATCHUP_STATUS'){
  const d=z.object({id:z.uuid(),action:z.enum(['COMPLETE','CANCEL','PUBLISH'])}).parse(input.data);
  const r=await db().rpc('manage_matchup',{p_id:d.id,p_action:d.action,p_actor:user.id});if(r.error)throw new HttpError(409,r.error.message);
 }else if(action==='MEDIA'){
  const d=z.object({matchup_id:z.uuid(),fighter_id:z.union([z.uuid(),z.literal('')]),title:z.string().min(1).max(150),kind:z.enum(['FULL_ROUNDS','HIGHLIGHT','SOCIAL_REEL']),url:safeUrl.refine(Boolean),published:z.boolean()}).parse(input.data);
  const m=result(await db().from('matchups').select('*').eq('id',d.matchup_id).single());
  if(m.status!=='COMPLETED'||(d.fighter_id&&![m.fighter_a_id,m.fighter_b_id].includes(d.fighter_id)))throw new HttpError(409,'Media must belong to a completed matchup.');
  if(d.published&&!m.published)throw new HttpError(409,'Approve matchup publication first.');
  result(await db().from('media').insert({...d,fighter_id:d.fighter_id||null}).select('id').single());
 }else if(action==='PROFILE'){
  const d=z.object({id:z.uuid(),profile_photo_url:safeUrl,profile_published:z.boolean()}).parse(input.data);
  const f=result(await db().from('fighters').select('visibility,date_of_birth').eq('id',d.id).single());
  const apps=result(await db().from('applications').select('media_consent,guardian_required').eq('fighter_id',d.id));
  if(d.profile_published&&(f.visibility!=='PUBLIC'||!apps.length||apps.some(a=>!a.media_consent||a.guardian_required)))throw new HttpError(409,'Public profile requires adult media consent.');
  result(await db().from('fighters').update({profile_photo_url:d.profile_photo_url||null,profile_published:d.profile_published}).eq('id',d.id).select('id').single());
 }else if(action==='CONTENT'){
  const d=z.object({id:z.uuid(),content_status:z.enum(['NOT_STARTED','EDITING','DELIVERED'])}).parse(input.data);
  result(await db().from('orders').update({content_status:d.content_status}).eq('id',d.id).eq('payment_status','PAID').select('id').single());
 }else if(action==='SESSION_STATUS'){
  const d=z.object({id:z.uuid(),status:z.enum(['UPCOMING','COMPLETED'])}).parse(input.data);
  if(d.status==='COMPLETED'){
   const count=await db().from('matchups').select('id',{count:'exact',head:true}).eq('session_id',d.id).not('status','in','(COMPLETED,CANCELLED)');
   if(count.error||count.count)throw new HttpError(409,'Complete or cancel all matchups first.');
  }
  result(await db().from('sessions').update({status:d.status}).eq('id',d.id).select('id').single());
 }else if(action==='RETRY_EMAILS'){
  await db().from('notification_outbox').update({attempts:0}).is('sent_at',null);value=await flushNotifications();
 }else throw new HttpError(400,'Unknown action.');
 if(action!=='MATCHUP'&&action!=='MATCHUP_STATUS')result(await db().from('audit_log').insert({actor:user.id,action,entity_id:input.data?.id||null}).select('id').single());
 return Response.json(value);
}catch(e){return failure(e);}}
