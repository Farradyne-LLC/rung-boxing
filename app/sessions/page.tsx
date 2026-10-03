import Link from 'next/link';
import {publicSessions} from '../lib/public-data';
export const dynamic='force-dynamic';
export const metadata={title:'Punch Sessions'};
export default async function Sessions(){const sessions=await publicSessions();return <div className="shell workspace"><p className="eyebrow">LOS ANGELES / CURATED TECHNICAL SPARRING</p><h1>PUNCH SESSIONS.</h1><p>Upcoming rounds and the archive. No winners or losers. Documented work.</p>{sessions.length===0?<p className="notice">The next Punch Session will be announced here. <Link href="/apply">Apply for future rounds →</Link></p>:<div className="record-list">{sessions.map(s=><article className="record-card" key={s.id}><p className="eyebrow">{s.status} · {s.date}</p><h2><Link href={`/sessions/${s.slug}`}>{s.title}</Link></h2><p>{s.location_name} · {s.city}</p><p>{s.description}</p><Link className="button outline" href={`/sessions/${s.slug}`}>VIEW SESSION →</Link></article>)}</div>}</div>;}
