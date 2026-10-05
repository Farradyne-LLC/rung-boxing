import {after} from 'next/server';
import {z} from 'zod';
import {body,db,env,failure,HttpError,liveReady,rate} from '../../lib/server';
import {flushNotifications} from '../../lib/notifications';
export async function POST(req:Request){try{
 if(!liveReady())throw new HttpError(503,'Updates registration is not open yet.');
 await rate(req,'subscribe',5);
 const d=z.object({firstName:z.string().trim().min(1).max(80),email:z.email().max(254),consent:z.literal(true),website:z.literal('')}).parse(await body(req));
 const {error}=await db().rpc('subscribe_updates',{p_name:d.firstName,p_email:d.email,p_admin_email:env('ADMIN_NOTIFICATION_EMAIL'),p_origin:env('ADMIN_URL')});
 if(error)throw new HttpError(503,'Unable to save your subscription. Please try again.');
 after(flushNotifications);return Response.json({ok:true});
}catch(e){return failure(e);}}
