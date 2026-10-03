import {cookies} from 'next/headers';
import {checkOrigin,failure} from '../../../lib/server';
export async function POST(req:Request){try{checkOrigin(req);(await cookies()).delete('pm-admin');return Response.json({ok:true});}catch(e){return failure(e);}}
