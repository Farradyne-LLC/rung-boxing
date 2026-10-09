import {after} from 'next/server';
import {body,env,failure,HttpError,rate} from '../../lib/server';
import {transaction} from '../../lib/postgres';
import {serviceRequestSchema,serviceNames} from '../../lib/service-request';
import {flushNotifications} from '../../lib/notifications';
export async function POST(req:Request){try{
 if(process.env.SERVICE_REQUESTS_OPEN!=='true')throw new HttpError(503,'Requests are temporarily unavailable. Please email farukhimin@gmail.com.');
 await rate(req,'service-request',6);const d=serviceRequestSchema.parse(await body(req));
 const {request_id,kind,name,email,instagram,website,...details}=d;void website;
 await transaction(async c=>{const r=await c.query('INSERT INTO service_requests(request_id,kind,name,email,instagram,details) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(request_id) DO NOTHING RETURNING id',[request_id,kind,name,email,instagram,details]);if(r.rows.length)await c.query('INSERT INTO notification_outbox(dedupe_key,recipient,subject,body) VALUES($1,$2,$3,$4)',['service-'+r.rows[0].id,env('ADMIN_NOTIFICATION_EMAIL'),'Punch Mentality — '+serviceNames[kind]+' request',`New ${serviceNames[kind]} request from ${name}. Review: ${env('ADMIN_URL')}/admin/services/${r.rows[0].id}`]);});
 after(flushNotifications);return Response.json({ok:true});
 }catch(e){return failure(e);}}
