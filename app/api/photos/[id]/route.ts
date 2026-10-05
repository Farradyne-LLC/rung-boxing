import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {notFound} from 'next/navigation';
import {sql} from '../../../lib/postgres';
import {admin} from '../../../lib/server';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))notFound();const {rows}=await sql().query(`SELECT p.filename, f.profile_published AND f.visibility='PUBLIC' AND EXISTS(SELECT 1 FROM applications a WHERE a.fighter_id=f.id) AND NOT EXISTS(SELECT 1 FROM applications a WHERE a.fighter_id=f.id AND (a.guardian_required OR NOT a.media_consent)) AS public FROM fighter_photos p JOIN fighters f ON f.id=p.fighter_id WHERE p.id=$1`,[id]);if(!rows[0])notFound();if(!rows[0].public){if(!process.env.ADMIN_INGRESS_SECRET||req.headers.get('x-punch-admin-ingress')!==process.env.ADMIN_INGRESS_SECRET)notFound();try{await admin();}catch{notFound();}}const file=path.join(process.env.PHOTO_DIR||'/data/photos',rows[0].filename);try{const bytes=await readFile(file);return new Response(bytes,{headers:{'Content-Type':'image/webp','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}catch{notFound();}}
