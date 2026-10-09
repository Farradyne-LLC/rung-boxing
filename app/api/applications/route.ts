import {after} from 'next/server';
import {randomUUID} from 'node:crypto';
import {writeFile,unlink,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {applicationSchema,TERMS_VERSION} from '../../lib/validation';
import {checkOrigin,env,failure,HttpError,liveReady,rate,hash} from '../../lib/server';
import {transaction,sql} from '../../lib/postgres';
import {applicationBody,preparePhotos} from '../../lib/photos';
import {flushNotifications} from '../../lib/notifications';
export async function POST(req:Request){const written:string[]=[];let committed=false;try{
 if(!liveReady())throw new HttpError(503,'Applications are not open yet. Please check back soon.');checkOrigin(req);if(Number(req.headers.get('content-length')||0)>16*1024*1024)throw new HttpError(413,'Application is too large.');await rate(req,'apply',6);
 const input=await applicationBody(req);const data=applicationSchema.parse(input.data);const photos=await preparePhotos(input.files);const dir=process.env.PHOTO_DIR||'/data/photos';
 const id=await transaction(async c=>{await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[data.request_id]);if(data.lead_token){const lead=await c.query('SELECT token_hash FROM application_leads WHERE request_id=$1 FOR UPDATE',[data.request_id]);if(!lead.rows[0]||lead.rows[0].token_hash!==hash(data.lead_token))throw new HttpError(403,'Please save your contact details first.');}const existing=await c.query('SELECT id FROM applications WHERE request_id=$1',[data.request_id]);if(existing.rows[0])return existing.rows[0].id;
 const r=await c.query('SELECT submit_application($1,$2,$3,$4) AS id',[{...data,terms_version:TERMS_VERSION},data.request_id,env('ADMIN_NOTIFICATION_EMAIL'),env('ADMIN_URL')]);const id=r.rows[0].id;const f=await c.query('SELECT fighter_id FROM applications WHERE id=$1',[id]);await c.query('UPDATE fighters SET boxrec_url=$1 WHERE id=$2',[data.boxrec_url||null,f.rows[0].fighter_id]);await mkdir(dir,{recursive:true});
 for(let i=0;i<photos.length;i++){const photoId=randomUUID(),filename=photoId+'.webp',file=path.join(dir,filename);await writeFile(file,photos[i],{flag:'wx',mode:0o600});written.push(file);await c.query('INSERT INTO fighter_photos(id,fighter_id,position,filename) VALUES($1,$2,$3,$4)',[photoId,f.rows[0].fighter_id,i,filename]);if(i===0)await c.query('UPDATE fighters SET profile_photo_url=$1 WHERE id=$2',['/api/photos/'+photoId,f.rows[0].fighter_id]);}
 if(data.lead_token)await c.query('UPDATE application_leads SET application_id=$1,updated_at=now() WHERE request_id=$2',[id,data.request_id]);return id;});committed=true;after(flushNotifications);return Response.json({id},{status:201});
 }catch(e){if(!committed)for(const file of written){try{const exists=await sql().query('SELECT id FROM fighter_photos WHERE filename=$1',[path.basename(file)]);if(!exists.rows.length)await unlink(file);}catch{/* Keep files if commit outcome is uncertain; never erase a committed photo. */}}return failure(e);}}
