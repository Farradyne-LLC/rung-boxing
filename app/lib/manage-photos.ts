import 'server-only';
import {after} from 'next/server';
import {flushNotifications} from './notifications';
import {z} from 'zod';
import {randomUUID} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {admin,checkOrigin,failure,HttpError,rate,env} from './server';
import {applicationBody,preparePhotos} from './photos';
import {fighterAccess} from './profile-access';
import {transaction} from './postgres';
const selection=z.string().regex(/^(?:[a-f0-9-]{36}|new:[0-2])$/).nullable();
const schema=z.object({fighter_id:z.uuid().optional(),version:z.number().int().min(0),keep:z.array(z.uuid()).max(3),avatar:selection,cover:selection});
export async function managePhotos(req:Request,isAdmin:boolean){try{
 checkOrigin(req);await rate(req,isAdmin?'admin-photos':'fighter-photos',20);
 const actor=isAdmin?await admin():null;const fighter=isAdmin?null:await fighterAccess(req.headers.get('authorization')?.replace(/^Bearer /,'')||'');
 const input=await applicationBody(req);const d=schema.parse(input.data);const id=fighter?.id||d.fighter_id;if(!id)throw new HttpError(400,'Choose a fighter.');
 if(new Set(d.keep).size!==d.keep.length||d.keep.length+input.files.length>3)throw new HttpError(400,'Choose up to three photos in total.');
 const bytes=await preparePhotos(input.files);
 await transaction(async c=>{
  const {rows}=await c.query('SELECT * FROM fighters WHERE id=$1 FOR UPDATE',[id]);const f=rows[0];if(!f)throw new HttpError(404,'Fighter not found.');if(f.photo_version!==d.version)throw new HttpError(409,'Photos changed in another window. Reload before editing.');
  const old=(await c.query('SELECT id,filename FROM fighter_photos WHERE fighter_id=$1 ORDER BY position',[id])).rows;
  if(d.keep.some(p=>!old.some(o=>o.id===p)))throw new HttpError(400,'Choose photos belonging to this profile.');
  const ids=[...d.keep,...bytes.map(()=>randomUUID())];
  const resolve=(key:string|null)=>{if(key===null)return null;const selected=key.startsWith('new:')?ids[d.keep.length+Number(key.slice(4))]:key;if(!ids.includes(selected))throw new HttpError(400,'Select an available avatar or cover.');return '/api/photos/'+selected;};
  const avatar=resolve(d.avatar),cover=resolve(d.cover);
  const dir=process.env.PHOTO_DIR||'/data/photos';await mkdir(dir,{recursive:true});
  for(let i=0;i<bytes.length;i++)await writeFile(path.join(dir,ids[d.keep.length+i]+'.webp'),bytes[i],{flag:'wx',mode:0o600});
  // Remove database references immediately; original files remain in protected storage for backup recovery.
  await c.query('DELETE FROM fighter_photos WHERE fighter_id=$1',[id]);
  for(let i=0;i<ids.length;i++)await c.query('INSERT INTO fighter_photos(id,fighter_id,position,filename) VALUES($1,$2,$3,$4)',[ids[i],id,i,old.find(p=>p.id===ids[i])?.filename||ids[i]+'.webp']);
  await c.query('UPDATE fighters SET profile_photo_url=$1,cover_photo_url=$2,photo_version=photo_version+1,profile_published=false WHERE id=$3',[avatar,cover,id]);
  await c.query('INSERT INTO audit_log(actor,actor_label,action,entity_id,changes) VALUES($1,$2,$3,$4,$5)',[actor?.id||null,actor?.email||'Fighter via private editing link','PHOTOS_UPDATED',id,{photos:{before:old.map(p=>p.id),after:ids},avatar:{before:f.profile_photo_url,after:avatar},cover:{before:f.cover_photo_url,after:cover},profile_published:{before:f.profile_published,after:false}}]);
 if(!actor)await c.query('INSERT INTO notification_outbox(dedupe_key,recipient,subject,body) VALUES($1,$2,$3,$4) ON CONFLICT(dedupe_key) DO NOTHING',['photo-review-'+id+'-'+(d.version+1),env('ADMIN_NOTIFICATION_EMAIL'),'Punch Mentality — profile photos need review',`A fighter updated their photos. Review the profile in ${env('ADMIN_URL')}/admin. Public display is paused until approval.`]);
 });after(flushNotifications);return Response.json({ok:true});
 }catch(e){return failure(e);}}
