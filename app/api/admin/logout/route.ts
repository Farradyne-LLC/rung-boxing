import {cookies} from 'next/headers';
import {checkOrigin,failure,hash} from '../../../lib/server';
import {sql} from '../../../lib/postgres';
export async function POST(req:Request){try{checkOrigin(req);const token=(await cookies()).get('pm-admin')?.value;if(token)await sql().query('DELETE FROM admin_sessions WHERE token_hash=$1',[hash(token)]);(await cookies()).delete('pm-admin');return Response.json({ok:true});}catch(e){return failure(e);}}
