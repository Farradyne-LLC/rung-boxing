import 'server-only';
import type {PoolClient} from 'pg';
import {sql} from './postgres';
import {hash,HttpError,newToken,origin} from './server';
export async function fighterAccess(token:string){
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))throw new HttpError(401,'This editing link is invalid or expired. Request a new link.');
 const r=await sql().query('SELECT f.id,f.display_name,f.public_slug,f.profile_photo_url,f.cover_photo_url,f.photo_version,f.profile_published FROM fighter_access_links l JOIN fighters f ON f.id=l.fighter_id WHERE l.token_hash=$1 AND l.expires_at>now()',[hash(token)]);
 if(!r.rows[0])throw new HttpError(401,'This editing link is invalid or expired. Request a new link.');return r.rows[0];
}
export async function createFighterAccess(c:PoolClient,id:string){const token=newToken();await c.query("INSERT INTO fighter_access_links(token_hash,fighter_id,expires_at) VALUES($1,$2,now()+interval '7 days')",[hash(token),id]);return `${origin()}/profile/edit/${token}`;}
