import 'server-only';
import {sql} from './postgres';
import {db,dbReady,result} from './server';
export async function publicSessions(){return dbReady()?result(await db().from('sessions').select('id,title,slug,date,start_time,location_name,city,status,description').eq('is_public',true).order('date',{ascending:false})):[];}
export async function publicFighters(){if(!dbReady())return [];const rows=result(await db().from('fighters').select('id,display_name,public_slug,current_weight,stance,gym,profile_photo_url').eq('profile_published',true).eq('visibility','PUBLIC'));const denied=(await sql().query('SELECT DISTINCT fighter_id FROM applications WHERE guardian_required OR NOT media_consent')).rows;return rows.filter(f=>!denied.some(a=>a.fighter_id===f.id));}
export async function publicMatchups(){
 if(!dbReady())return [];
 const rows=result(await db().from('matchups').select('id,session_id,fighter_a_id,fighter_b_id,rounds,round_length,published,status,application_a_id,application_b_id').eq('published',true).eq('status','COMPLETED'));
 const sessions=await publicSessions();const ids=rows.flatMap(m=>[m.application_a_id,m.application_b_id]);
 if(!ids.length)return [];
 const consent=result(await db().from('applications').select('id,media_consent,guardian_required,fighters(visibility)').in('id',ids));
 return rows.filter(m=>sessions.some(s=>s.id===m.session_id)&&[m.application_a_id,m.application_b_id].every(id=>{const a=consent.find(a=>a.id===id);const f=Array.isArray(a?.fighters)?a.fighters[0]:a?.fighters;return a?.media_consent&&!a.guardian_required&&f?.visibility==='PUBLIC';}));
}
export async function publicMedia(){const matches=await publicMatchups();return matches.length?result(await db().from('media').select('id,matchup_id,fighter_id,title,kind,url,created_at').eq('published',true).in('matchup_id',matches.map(m=>m.id)).order('created_at',{ascending:false})):[];}
