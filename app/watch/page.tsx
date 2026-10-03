import Link from 'next/link';
import {publicMedia} from '../lib/public-data';
import MediaPlayer from '../components/media-player';
export const dynamic='force-dynamic';
export const metadata={title:'Watch the rounds'};
export default async function Watch(){const media=await publicMedia();return <div className="shell workspace"><p className="eyebrow">SHOW YOUR ROUNDS</p><h1>THE WORK. ON FILM.</h1>{media.length===0?<p className="notice">Approved Punch footage will appear here after the first published sessions. <Link href="/sessions">Explore sessions →</Link></p>:<><section><h2>FEATURED ROUNDS.</h2><MediaPlayer url={media[0].url} title={media[0].title}/></section>{[['FULL_ROUNDS','FULL ROUNDS.'],['HIGHLIGHT','FIGHTER HIGHLIGHTS.'],['SOCIAL_REEL','SHORT FORM.']].map(([kind,title])=><section key={kind}><h2>{title}</h2><div className="record-list">{media.filter(m=>m.kind===kind).map(m=><MediaPlayer key={m.id} url={m.url} title={m.title}/>)}</div></section>)}</>}</div>;}
