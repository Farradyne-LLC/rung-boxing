import {after} from 'next/server';
import {applicationSchema,TERMS_VERSION} from '../../lib/validation';
import {body,db,env,failure,HttpError,liveReady,origin,rate,result} from '../../lib/server';
import {flushNotifications} from '../../lib/notifications';
export async function POST(req:Request){try{
 if(!liveReady())throw new HttpError(503,'Applications are not open yet. Please check back soon.');
 await rate(req,'apply',6);const data=applicationSchema.parse(await body(req));
 const id=result(await db().rpc('submit_application',{p_data:{...data,terms_version:TERMS_VERSION},p_request_id:data.request_id,p_admin_email:env('ADMIN_NOTIFICATION_EMAIL'),p_origin:origin()}));
 after(flushNotifications);return Response.json({id},{status:201});
}catch(e){return failure(e);}}
