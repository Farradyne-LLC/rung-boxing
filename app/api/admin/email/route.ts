import {z} from 'zod';
import {after} from 'next/server';
import {body,db,env,failure,origin,rate,HttpError} from '../../../lib/server';
import {flushNotifications} from '../../../lib/notifications';
export async function POST(req:Request){try{
 await rate(req,'admin-email',3);const {email}=z.object({email:z.email().transform(s=>s.toLowerCase())}).parse(await body(req));
 if(env('ADMIN_EMAILS').split(',').map(s=>s.trim().toLowerCase()).includes(email)){
  if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM)throw new HttpError(503,'Email sign-in is being configured. Please try again later.');
  const {data,error}=await db().auth.admin.generateLink({type:'magiclink',email});
  if(error||!data.properties?.hashed_token)throw new HttpError(503,'Unable to create a sign-in link.');
  const token=data.properties.hashed_token;
  const saved=await db().from('notification_outbox').insert({dedupe_key:'admin-login-'+token,recipient:email,subject:'Punch Mentality — admin sign-in',body:`Open this one-time link to sign in to your Punch dashboard: ${origin()}/admin/access?token=${token}\nIf you did not request this link, ignore this email.`});
  if(saved.error)throw new HttpError(503,'Unable to queue your sign-in email.');after(flushNotifications);
 }
 return Response.json({ok:true});
}catch(e){return failure(e);}}
