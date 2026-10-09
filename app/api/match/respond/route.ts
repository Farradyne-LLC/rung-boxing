import {transaction} from '../../../lib/postgres';
import {z} from 'zod';
import {body,failure,hash,invitation,rate,HttpError} from '../../../lib/server';
export async function POST(req:Request){try{
 await rate(req,'confirmation',30);const d=z.object({token:z.string(),accept:z.boolean(),emergency_name:z.string().trim().max(150).default(''),emergency_phone:z.string().trim().max(40).default('')}).parse(await body(req));const {c}=await invitation(d.token);if(d.accept&&(!d.emergency_name||d.emergency_phone.replace(/\D/g,'').length<7))throw new HttpError(400,'Add an emergency contact name and valid phone number.');
 const status=await transaction(async client=>{if(d.accept)await client.query('UPDATE fighters SET emergency_name=$1,emergency_phone=$2 WHERE id=$3',[d.emergency_name,d.emergency_phone,c.fighter_id]);const r=await client.query('SELECT respond_matchup($1,$2) AS status',[hash(d.token),d.accept]);return r.rows[0].status;});return Response.json({status});
}catch(e){return failure(e);}}
