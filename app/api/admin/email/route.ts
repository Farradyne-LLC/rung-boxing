import {z} from 'zod';
import {randomBytes} from 'node:crypto';
import {after} from 'next/server';
import {body,env,failure,rate,HttpError,hash} from '../../../lib/server';
import {transaction} from '../../../lib/postgres';
import {flushNotifications} from '../../../lib/notifications';
export async function POST(req:Request){try{await rate(req,'admin-email',3);const {email}=z.object({email:z.email().transform(s=>s.toLowerCase())}).parse(await body(req));if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM)throw new HttpError(503,'Email sign-in is not configured. Use your administrator password.');if(env('ADMIN_EMAILS').split(',').includes(email)){await transaction(async c=>{const {rows}=await c.query('SELECT id FROM admin_users WHERE email=$1 AND active',[email]);if(!rows[0])return;const token=randomBytes(32).toString('hex');await c.query("INSERT INTO admin_links VALUES($1,$2,now()+interval '15 minutes')",[hash(token),rows[0].id]);await c.query('INSERT INTO notification_outbox(dedupe_key,recipient,subject,body) VALUES($1,$2,$3,$4)',['login-'+hash(token),email,'Punch Mentality — admin sign-in',`${env('ADMIN_URL')}/admin/access?token=${token}\nExpires in 15 minutes. Requires Tailscale.`]);});after(flushNotifications);}return Response.json({ok:true});}catch(e){return failure(e);}}
