import {env,failure,HttpError} from '../../lib/server';
import {flushNotifications} from '../../lib/notifications';
export async function GET(req:Request){try{if(req.headers.get('authorization')!==`Bearer ${env('CRON_SECRET')}`)throw new HttpError(401,'Unauthorized');return Response.json(await flushNotifications());}catch(e){return failure(e);}}
