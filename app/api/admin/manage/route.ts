import {after} from 'next/server';
import {z} from 'zod';
import {admin,body,db,failure,hash,newToken,origin,result,HttpError} from '../../../lib/server';
import {matchupSchema,sessionSchema,safeUrl} from '../../../lib/validation';
import {flushNotifications} from '../../../lib/notifications';
import {editApplication} from '../../../lib/admin-edit';
import {sql,transaction} from '../../../lib/postgres';
export async function POST(req:Request){try{
 const user=await admin();const input=await body(req);const action=z.string().parse(input.action);let value:unknown={ok:true};
 if(action==='EDIT_APPLICATION')return Response.json(await editApplication(input.data,user));
 if(action==='CONTENT_TERMS'){
 const d=z.object({id:z.uuid(),version:z.coerce.number().int().nonnegative(),content_terms:z.string().trim().min(30).max(5000)}).parse(input.data);
 await transaction(async c=>{const old=(await c.query('SELECT * FROM matchups WHERE id=$1 FOR UPDATE',[d.id])).rows[0];if(!old||old.content_terms_version!==d.version)throw new HttpError(409,'Order details changed. Reload first.');const orders=await c.query("SELECT 1 FROM orders WHERE matchup_id=$1 AND payment_status IN ('PENDING','PAID','REFUNDED') LIMIT 1",[d.id]);if(orders.rows.length)throw new HttpError(409,'An order already uses these terms. Resolve existing orders before changing the offer.');await c.query('UPDATE matchups SET content_terms=$2,content_terms_version=content_terms_version+1 WHERE id=$1',[d.id,d.content_terms]);await c.query('INSERT INTO audit_log(actor,actor_label,action,entity_id,changes) VALUES($1,$2,$3,$4,$5)',[user.id,user.email,'CONTENT_TERMS',d.id,{before:old.content_terms,after:d.content_terms}]);});return Response.json({ok:true});
 }
 if(action==='SERVICE_REQUEST'){
 const d=z.object({id:z.uuid(),version:z.coerce.number().int().nonnegative(),status:z.enum(['NEW','REVIEWING','NEEDS_MATERIAL','QUOTED','BOOKED','DELIVERED','DECLINED','CLOSED']),internal_notes:z.string().max(5000),response_notes:z.string().max(5000)}).parse(input.data);
 await transaction(async c=>{const old=(await c.query('SELECT * FROM service_requests WHERE id=$1 FOR UPDATE',[d.id])).rows[0];if(!old||old.version!==d.version)throw new HttpError(409,'Request changed. Reload before saving.');if(['NEEDS_MATERIAL','DECLINED'].includes(d.status)&&d.response_notes.trim().length<10)throw new HttpError(400,'Record the response or material needed before changing this status.');await c.query('UPDATE service_requests SET status=$2,internal_notes=$3,response_notes=$4,version=version+1,updated_at=now() WHERE id=$1',[d.id,d.status,d.internal_notes,d.response_notes]);await c.query('INSERT INTO audit_log(actor,actor_label,action,entity_id,changes) VALUES($1,$2,$3,$4,$5)',[user.id,user.email,'SERVICE_REQUEST',d.id,{before:{status:old.status,internal_notes:old.internal_notes,response_notes:old.response_notes},after:d}]);});return Response.json({ok:true});
 }
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
 }else if(action==='PROFILE_VIDEO'){
  const d=z.object({id:z.uuid(),title:z.string().trim().min(1).max(150),url:safeUrl.refine(Boolean),published:z.boolean(),permission_confirmed:z.boolean()}).parse(input.data);
  const eligible=await sql().query("SELECT id FROM fighters f WHERE id=$1 AND visibility='PUBLIC' AND profile_published AND NOT EXISTS(SELECT 1 FROM applications a WHERE a.fighter_id=f.id AND (a.guardian_required OR NOT a.media_consent))",[d.id]);
  if(d.published&&(!eligible.rows.length||!d.permission_confirmed))throw new HttpError(409,'Public video requires an approved adult Public profile and publication permission for everyone shown.');
  await sql().query('INSERT INTO profile_media(fighter_id,title,url,published) VALUES($1,$2,$3,$4)',[d.id,d.title,d.url,d.published]);
 }else if(action==='REMOVE_PROFILE_VIDEO'){
  const d=z.object({id:z.uuid()}).parse(input.data);await sql().query('DELETE FROM profile_media WHERE id=$1',[d.id]);
 }else if(action==='PROFILE'){
  const d=z.object({id:z.uuid(),photo_version:z.number().int().nonnegative(),edit_version:z.number().int().nonnegative(),profile_photo_url:z.string().max(1500),profile_published:z.boolean()}).parse(input.data);
  if(d.profile_photo_url.startsWith('/api/photos/')){const p=await sql().query('SELECT id FROM fighter_photos WHERE id::text=$1 AND fighter_id=$2',[d.profile_photo_url.slice(12),d.id]);if(!p.rows.length)throw new HttpError(400,'Choose a photo belonging to this fighter.');}else safeUrl.parse(d.profile_photo_url);
  const f=result(await db().from('fighters').select('visibility,date_of_birth').eq('id',d.id).single());
  const apps=result(await db().from('applications').select('media_consent,guardian_required').eq('fighter_id',d.id));
  if(d.profile_published&&(f.visibility!=='PUBLIC'||!apps.length||apps.some(a=>!a.media_consent||a.guardian_required)))throw new HttpError(409,'Public profile requires adult media consent.');
  const updated=await sql().query(`UPDATE fighters f SET profile_photo_url=$2,profile_published=$3,photo_version=photo_version+1 WHERE id=$1 AND photo_version=$4 AND edit_version=$5 AND (NOT $3 OR (visibility='PUBLIC' AND EXISTS(SELECT 1 FROM applications a WHERE a.fighter_id=f.id) AND NOT EXISTS(SELECT 1 FROM applications a WHERE a.fighter_id=f.id AND (NOT a.media_consent OR a.guardian_required)))) RETURNING id`,[d.id,d.profile_photo_url||null,d.profile_published,d.photo_version,d.edit_version]);
   if(!updated.rows.length)throw new HttpError(409,'Profile changed or requires review. Reload before publishing.');
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
  await db().from('notification_outbox').update({attempts:0,next_attempt_at:new Date().toISOString()}).is('sent_at',null);value=await flushNotifications();
 }else throw new HttpError(400,'Unknown action.');
 if(action!=='MATCHUP'&&action!=='MATCHUP_STATUS')result(await db().from('audit_log').insert({actor:user.id,actor_label:user.email,action,entity_id:input.data?.id||null}).select('id').single());
 return Response.json(value);
}catch(e){return failure(e);}}
