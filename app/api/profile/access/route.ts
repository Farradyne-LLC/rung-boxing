import {after} from 'next/server';
import {z} from 'zod';
import {body,failure,rate,hash} from '../../../lib/server';
import {transaction} from '../../../lib/postgres';
import {createFighterAccess} from '../../../lib/profile-access';
import {flushNotifications} from '../../../lib/notifications';
export async function POST(req:Request){try{await rate(req,'profile-access',5);const {email,website}=z.object({email:z.email().max(254).transform(v=>v.toLowerCase()),website:z.literal('').default('')}).parse(await body(req));void website;
 await transaction(async c=>{const fighters=await c.query('SELECT id FROM fighters WHERE lower(email)=$1 ORDER BY created_at DESC LIMIT 5',[email]);for(const f of fighters.rows){const recent=await c.query("SELECT 1 FROM fighter_access_links WHERE fighter_id=$1 AND created_at>now()-interval '15 minutes' LIMIT 1",[f.id]);if(recent.rowCount)continue;const link=await createFighterAccess(c,f.id);await c.query('INSERT INTO notification_outbox(dedupe_key,recipient,subject,body) VALUES($1,$2,$3,$4)',['profile-link-'+hash(link),email,'Punch Mentality — manage your photos',`Manage your avatar, cover and photos: ${link}\nPrivate editing link. Do not share. Expires in 7 days. Photos require organizer review before public display.`]);}});after(flushNotifications);return Response.json({ok:true});
 }catch(e){return failure(e);}}
