import 'server-only';
import {cookies} from 'next/headers';
import {sql} from './postgres';
import {hash,HttpError,newToken,origin} from './server';
import type {PoolClient} from 'pg';
export async function member(optional=false){
 const token=(await cookies()).get('pm-member')?.value;
 const row=token?(await sql().query('SELECT f.* FROM member_sessions s JOIN fighters f ON f.id=s.fighter_id WHERE s.token_hash=$1 AND s.expires_at>now()',[hash(token)])).rows[0]:null;
 if(!row&&!optional)throw new HttpError(401,'Sign in to My Punch to continue.');return row;
}
export async function setMemberSession(id:string){const token=newToken();await sql().query("INSERT INTO member_sessions VALUES($1,$2,now()+interval '7 days')",[hash(token),id]);(await cookies()).set('pm-member',token,{httpOnly:true,secure:origin().startsWith('https:'),sameSite:'lax',path:'/',maxAge:604800});}
export async function notifyMember(c:PoolClient,id:string,message:string,href='/requests'){
 const n=await c.query('INSERT INTO member_notifications(fighter_id,message,href) VALUES($1,$2,$3) RETURNING id',[id,message,href]);
 await c.query("INSERT INTO notification_outbox(dedupe_key,recipient,subject,body) SELECT $1,email,'Your Punch update',$2 FROM fighters WHERE id=$3 AND email_notifications",['member-notice-'+n.rows[0].id,message+'\nOpen My Punch: '+origin()+href,id]);
}
export const directoryEligibility=`f.directory_visible AND f.looking_for_rounds AND f.profile_published AND f.visibility='PUBLIC' AND f.date_of_birth<=current_date-interval '18 years' AND EXISTS(SELECT 1 FROM applications a WHERE a.fighter_id=f.id) AND NOT EXISTS(SELECT 1 FROM applications a WHERE a.fighter_id=f.id AND (a.guardian_required OR NOT a.media_consent))`;
export const partnerProjection=`f.id,f.public_slug,f.display_name,f.city,f.profile_photo_url,f.current_weight,f.weight_updated_at,f.competition_weight,f.training_level,f.sparring_intensity,f.years_boxing,f.stance,f.goals,f.available_days,f.available_times,f.availability_updated_at,f.competition_experience,f.amateur_fights,f.professional_fights,f.preferred_venues,f.bio`;
