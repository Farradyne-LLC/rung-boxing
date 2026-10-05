import {after} from 'next/server';
import {randomUUID} from 'node:crypto';
import {writeFile,unlink,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {applicationSchema,TERMS_VERSION} from '../../lib/validation';
import {checkOrigin,env,failure,HttpError,liveReady,rate} from '../../lib/server';
import {transaction} from '../../lib/postgres';
import {applicationBody,preparePhotos} from '../../lib/photos';
import {flushNotifications} from '../../lib/notifications';
export async function POST(req:Request){const written:string[]=[];let committed=false;try{
 if(!liveReady())throw new HttpError(503,'Applications are not open yet. Please check back soon.');checkOrigin(req);await rate(req,'apply',6);
 const input=await applicationBody(req);const data=applicationSchema.parse(input.data);const photos=await preparePhotos(input.files);const dir=process.env.PHOTO_DIR||'/data/photos';
 const id=await transaction(async c=>{await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[data.request_id]);const existing=await c.query('SELECT id FROM applications WHERE request_id=$1',[data.request_id]);if(existing.rows[0])return existing.rows[0].id;
 const r=await c.query('SELECT submit_application($1,$2,$3,$4) AS id',[{...data,terms_version:TERMS_VERSION},data.request_id,env('ADMIN_NOTIFICATION_EMAIL'),env('ADMIN_URL')]);const id=r.rows[0].id;const f=await c.query('SELECT fighter_id FROM applications WHERE id=$1',[id]);await mkdir(dir,{recursive:true});
 for(let i=0;i<photos.length;i++){const photoId=randomUUID(),filename=photoId+'.webp',file=path.join(dir,filename);await writeFile(file,photos[i],{flag:'wx',mode:0o600});written.push(file);await c.query('INSERT INTO fighter_photos(id,fighter_id,position,filename) VALUES($1,$2,$3,$4)',[photoId,f.rows[0].fighter_id,i,filename]);if(i===0)await c.query('UPDATE fighters SET profile_photo_url=$1 WHERE id=$2',['/api/photos/'+photoId,f.rows[0].fighter_id]);}
 return id;});committed=true;after(flushNotifications);return Response.json({id},{status:201});
 }catch(e){if(!committed)await Promise.allSettled(written.map(f=>unlink(f)));return failure(e);}}
