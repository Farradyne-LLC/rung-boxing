import {cookies} from 'next/headers';
import {createClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {body,env,rate,failure,HttpError} from '../../../lib/server';
export async function POST(req:Request){try{
 await rate(req,'login',10);const d=z.object({email:z.email(),password:z.string().min(1).max(200)}).parse(await body(req));
 const client=createClient(env('SUPABASE_URL'),env('SUPABASE_ANON_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.signInWithPassword(d);
 if(error||!data.session||!data.user.email_confirmed_at||!env('ADMIN_EMAILS').split(',').map(s=>s.trim().toLowerCase()).includes(d.email.toLowerCase()))throw new HttpError(401,'Unable to sign in. Check your administrator credentials.');
 (await cookies()).set('pm-admin',data.session.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:Math.min(data.session.expires_in,3600)});
 return Response.json({ok:true});
}catch(e){return failure(e);}}
