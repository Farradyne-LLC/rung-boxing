import {after} from 'next/server';
import {cookies} from 'next/headers';
import {z} from 'zod';
import {body,failure,rate,hash,newToken,origin,HttpError} from '../../../lib/server';
import {sql,transaction} from '../../../lib/postgres';
import {setMemberSession} from '../../../lib/member';
import {flushNotifications} from '../../../lib/notifications';
export async function POST(req:Request){try{
 await rate(req,'member-auth',8);const d=await body(req);
 if(d.action==='logout'){const token=(await cookies()).get('pm-member')?.value;if(token)await sql().query('DELETE FROM member_sessions WHERE token_hash=$1',[hash(token)]);(await cookies()).delete('pm-member');return Response.json({ok:true});}
 if(d.action==='redeem'){
 const token=z.string().regex(/^[A-Za-z0-9_-]{43}$/).parse(d.token);
 const id=await transaction(async c=>{const r=await c.query('UPDATE member_login_links SET used_at=now() WHERE token_hash=$1 AND expires_at>now() AND used_at IS NULL RETURNING fighter_id',[hash(token)]);if(!r.rows[0])throw new HttpError(401,'This sign-in link expired or was already used. Request a new one.');return r.rows[0].fighter_id;});await setMemberSession(id);return Response.json({ok:true});
 }
 const email=z.email().max(254).parse(d.email).toLowerCase();
 await transaction(async c=>{await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',['login:'+email]);const f=(await c.query('SELECT id FROM fighters WHERE lower(email)=$1 ORDER BY created_at DESC LIMIT 1',[email])).rows[0];if(!f)return;const recent=await c.query("SELECT 1 FROM member_login_links WHERE fighter_id=$1 AND expires_at>now()+interval '10 minutes'",[f.id]);if(recent.rowCount)return;const token=newToken();await c.query("INSERT INTO member_login_links VALUES($1,$2,now()+interval '15 minutes',NULL)",[hash(token),f.id]);const next=typeof d.next==='string'&&/^\/(partners|requests|my-punch|sessions)([/?#]|$)/.test(d.next)?d.next:'/my-punch';await c.query('INSERT INTO notification_outbox(dedupe_key,recipient,subject,body) VALUES($1,$2,$3,$4)',['member-login-'+hash(token),email,'Sign in to My Punch',`Open ${origin()}/my-punch/login?token=${token}&next=${encodeURIComponent(next)}\nThis private sign-in link expires in 15 minutes. Do not share it.`]);});after(flushNotifications);return Response.json({ok:true,message:'If an application uses this email, a sign-in link will arrive shortly. New here? Apply to Spar first.'});
 }catch(e){return failure(e);}}
