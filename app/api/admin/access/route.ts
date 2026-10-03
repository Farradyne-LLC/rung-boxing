import {cookies} from 'next/headers';
import {z} from 'zod';
import {body,db,env,failure,HttpError,rate} from '../../../lib/server';
export async function POST(req:Request){try{
 await rate(req,'admin-access',10);const {token}=z.object({token:z.string().regex(/^[a-f0-9]{40,128}$/)}).parse(await body(req));
 const {data,error}=await db().auth.verifyOtp({token_hash:token,type:'magiclink'});
 if(error||!data.session||!data.user?.email||!env('ADMIN_EMAILS').split(',').map(s=>s.trim().toLowerCase()).includes(data.user.email.toLowerCase()))throw new HttpError(401,'This sign-in link is invalid or expired. Request another.');
 (await cookies()).set('pm-admin',data.session.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:Math.min(data.session.expires_in,3600)});
 return Response.json({ok:true});
}catch(e){return failure(e);}}
