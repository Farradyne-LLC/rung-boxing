import {z} from 'zod';
import {body,env,rate,failure,HttpError} from '../../../lib/server';
import {sql} from '../../../lib/postgres';
import {createSession,verifyPassword} from '../../../lib/auth';
export async function POST(req:Request){try{await rate(req,'login',10);const d=z.object({email:z.email(),password:z.string().min(1).max(200)}).parse(await body(req));const {rows}=await sql().query('SELECT * FROM admin_users WHERE email=$1 AND active',[d.email.toLowerCase()]);const user=rows[0];if(!user?.password_hash||!verifyPassword(d.password,user.password_hash)||!env('ADMIN_EMAILS').split(',').includes(user.email))throw new HttpError(401,'Unable to sign in. Check your administrator credentials.');await createSession(user.id);return Response.json({ok:true});}catch(e){return failure(e);}}
