import Link from 'next/link';
import {member} from '../lib/member';
import ApplicationForm from './application-form';
import {db,dbReady,liveReady,result} from '../lib/server';
export const metadata={title:'Apply to spar',alternates:{canonical:'https://punchmentality.com/apply'}};
export const dynamic='force-dynamic';
export default async function Apply({searchParams}:{searchParams:Promise<{session?:string}>}){
 const params=await searchParams;
 const existing=dbReady()?await member(true):null;
 if(existing)return <section className="product-section"><div className="shell"><p className="eyebrow">MY PUNCH</p><h1>READY FOR MORE ROUNDS?</h1><p>You are already registered. Your boxing details and application are saved — no need to fill them in again.</p><p>Request a place in an upcoming session from My Punch, or find a partner. Every matchup still needs organizer approval.</p><div className="pm-actions"><Link className="button red" href="/my-punch">MY PUNCH / SESSIONS</Link><Link className="button outline" href="/partners">FIND PARTNERS</Link></div></div></section>;
 const sessions=dbReady()?result(await db().from('sessions').select('id,title,date').eq('is_public',true).eq('status','UPCOMING').gte('date',new Date().toISOString().slice(0,10)).order('date')):[];
 return <><section className="page-intro application-intro"><div className="shell"><p className="eyebrow">CURATED TECHNICAL SPARRING / LOS ANGELES</p><h1>SHOW YOUR <span className="red-text">ROUNDS.</span></h1><p>Three short steps. Free to apply. Every matchup is reviewed by our team.</p></div></section><section className="product-section application-section"><div className="shell application-layout"><aside className="application-aside"><h2>THE RIGHT ROUNDS.</h2><p>Matched by age, weight, experience, availability and coach judgment.</p><div className="price-summary"><div><span>Sparring participation</span><b>FREE</b></div><div><span>Optional Content Pack</span><b>$99</b></div></div><p>Applying does not guarantee a place. Content purchases never affect eligibility.</p></aside><ApplicationForm sessions={sessions} sessionId={sessions.some(s=>s.id===params.session)?params.session!:''} open={liveReady()}/></div></section></>;
}
