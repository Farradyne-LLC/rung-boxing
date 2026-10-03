import {z} from 'zod';
import {body,db,failure,hash,invitation,rate,HttpError} from '../../../lib/server';
export async function POST(req:Request){try{
 await rate(req,'confirmation',30);const d=z.object({token:z.string(),accept:z.boolean()}).parse(await body(req));await invitation(d.token);
 const r=await db().rpc('respond_matchup',{p_hash:hash(d.token),p_accept:d.accept});if(r.error)throw new HttpError(409,'This invitation is no longer open. Please contact the organizer.');return Response.json({status:r.data});
}catch(e){return failure(e);}}
