import Link from 'next/link';
import {fighterAccess} from '../../../lib/profile-access';
import {sql} from '../../../lib/postgres';
import ProfilePhotos from '../../../components/profile-photos';
export const dynamic='force-dynamic';
export const metadata={title:'Manage your Punch photos',robots:{index:false,follow:false},referrer:'no-referrer' as const};
export default async function Edit({params}:{params:Promise<{token:string}>}){const {token}=await params;let f;try{f=await fighterAccess(token);}catch{return <div className="shell workspace"><h1>EDITING LINK UNAVAILABLE.</h1><p>The link may have expired.</p><Link href="/profile/access">Request a new editing link</Link></div>;}const photos=(await sql().query('SELECT id FROM fighter_photos WHERE fighter_id=$1 ORDER BY position',[f.id])).rows;return <div className="shell workspace narrow"><h1>YOUR PROFILE PHOTOS.</h1><h2>{f.display_name}</h2><p>This is your private editing link. Do not share it. Your public profile remains subject to consent and organizer review.</p><ProfilePhotos key={f.photo_version} fighterId={f.id} photos={photos} avatar={f.profile_photo_url} cover={f.cover_photo_url} version={f.photo_version} token={token}/></div>;}
