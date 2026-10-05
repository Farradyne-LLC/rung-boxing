import {z} from 'zod';
import {body,failure,HttpError,rate,hash} from '../../../lib/server';
import {sql} from '../../../lib/postgres';
import {createSession} from '../../../lib/auth';
export async function POST(req:Request){try{await rate(req,'admin-access',10);const {token}=z.object({token:z.string().regex(/^[a-f0-9]{64}$/)}).parse(await body(req));const {rows}=await sql().query('DELETE FROM admin_links WHERE token_hash=$1 AND expires_at>now() RETURNING admin_id',[hash(token)]);if(!rows[0])throw new HttpError(401,'This sign-in link is invalid or expired.');await createSession(rows[0].admin_id);return Response.json({ok:true});}catch(e){return failure(e);}}
