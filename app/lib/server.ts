import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import { ZodError } from 'zod';
export class HttpError extends Error {constructor(public status:number,message:string){super(message);}}
export function env(name:string){const v=process.env[name];if(!v)throw new HttpError(503,'This service is being configured. Please try again later.');return v;}
export function dbReady(){return Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY);}
export function liveReady(){return dbReady()&&process.env.APPLICATIONS_OPEN==='true';}
export function db(){return createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});}
export function origin(){return new URL(env('APP_URL')).origin;}
export function hash(value:string){return createHash('sha256').update(value).digest('hex');}
export function newToken(){return randomBytes(32).toString('base64url');}
export function checkOrigin(req:Request){if(req.headers.get('origin')!==origin())throw new HttpError(403,'Request origin is not allowed.');}
export async function body(req:Request){checkOrigin(req);const raw=await req.text();if(raw.length>30000)throw new HttpError(413,'Request too large.');try{return JSON.parse(raw);}catch{throw new HttpError(400,'Invalid request.');}}
export async function rate(req:Request,scope:string,limit=10){
 // Vercel overwrites this header at the edge; do not trust client x-forwarded-for.
 const ip=process.env.VERCEL?req.headers.get('x-vercel-forwarded-for'):'local';
 const {data,error}=await db().rpc('take_rate_limit',{p_key:hash(scope+':'+(ip||'unknown')),p_limit:limit,p_seconds:900});
 if(error)throw new HttpError(503,'Please try again later.');if(!data)throw new HttpError(429,'Too many requests. Please try again in 15 minutes.');
}
export function result<T>(r:{data:T;error:unknown}):NonNullable<T>{if(r.error||r.data===null)throw new HttpError(500,'Could not save or load this record. Please try again.');return r.data as NonNullable<T>;}
export function failure(e:unknown){
 if(e instanceof ZodError)return Response.json({error:e.issues[0]?.message||'Check your entries.'},{status:400});
 if(e instanceof HttpError)return Response.json({error:e.message},{status:e.status});
 console.error('Punch request failed', e instanceof Error?e.name:'UnknownError');
 return Response.json({error:'Something went wrong. Your changes may not have been saved. Please try again.'},{status:500});
}
export async function admin(){
 const token=(await cookies()).get('pm-admin')?.value;
 if(!token)throw new HttpError(401,'Please sign in.');
 const {data,error}=await db().auth.getUser(token);
 const allowed=env('ADMIN_EMAILS').split(',').map(s=>s.trim().toLowerCase());
 if(error||!data.user?.email||!data.user.email_confirmed_at||!allowed.includes(data.user.email.toLowerCase()))throw new HttpError(401,'Please sign in with an authorized administrator account.');
 return data.user;
}
export async function invitation(token:string){
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))throw new HttpError(404,'Invitation is invalid or expired.');
 const c=result(await db().from('fighter_matchup_confirmations').select('*').eq('token_hash',hash(token)).gt('expires_at',new Date().toISOString()).maybeSingle());
 const m=result(await db().from('matchups').select('*').eq('id',c.matchup_id).single());
 return {c,m};
}
