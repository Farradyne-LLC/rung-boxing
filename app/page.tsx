import Link from 'next/link';
import Image from 'next/image';
import UpdatesForm from './components/updates-form';
import HeroBackground from './components/hero-background';
import {Arrow,ProfileCard} from './components/ui';
import {pageMetadata} from './lib/seo';
export const metadata=pageMetadata('Punch Mentality — Show Your Rounds','Organized technical sparring in Los Angeles County and Orange County. Free participation, optional filming packages, personal highlights and private shoots.','/');
import {publicSessions} from './lib/public-data';
export const dynamic='force-dynamic';
const faqs=[
 ['Is sparring free?','Yes. Approved sparring participation is currently free. Buying content is optional and never affects eligibility.'],
 ['How do I get matched?','Apply with your age, weight, experience, skill and availability. Our team reviews applications individually and builds pairings with coach judgment. There is no automated matching.'],
 ['Does applying guarantee a place?','No. If a suitable pairing is available, you will receive a private invitation with session information and confirmation options.'],
 ['When can I buy the Content Pack?','Only after both fighters confirm the matchup. The founding price is $99 per fighter. You can decline the package and still spar.'],
 ['What does the Content Pack include?','An edited recording of one agreed sparring matchup and one shared vertical highlights reel. Personal highlights are separate orders. Three correction rounds and Google Drive delivery; scope and delivery date are confirmed before payment.'],
 ['Will my footage be public?','Adult applications are Public by default, with explicit media consent and organizer review before publication. You can request a quote for private arrangements after applying. Shared footage needs permission from both fighters; under-18 profiles remain private.'],
 ['Can someone under 18 apply?','Under-18 applications are flagged for individual guardian review. No matchup can be created until the required guardian review is completed. Youth profiles and footage are not published in this MVP.'],
 ['What equipment do I need?','Headgear, mouthguard, wraps, groin protection and suitable gloves. 16 oz is the default; 14 oz requires coach approval. Final gear and readiness checks happen on site.'],
];
export default async function Home(){
 const sessions=await publicSessions();
 const next=sessions.filter(s=>s.status==='UPCOMING'&&s.date>=new Date().toISOString().slice(0,10)).sort((a,b)=>a.date.localeCompare(b.date))[0];
 return <>
 <section className="rounds-hero shell" id="top">
  <div className="rounds-intro">
   <p className="eyebrow">LOS ANGELES SPARRING COMMUNITY</p>
   <h1>SHOW YOUR<br/><span>ROUNDS.</span></h1>
   <p className="rounds-description">Good partners. Real rounds. Your boxing, on film.</p>
   <p className="rounds-detail">Coach-curated technical sparring. Matched by weight and experience.</p>
   <div className="rounds-actions"><Link className="button red" href="/apply">APPLY TO SPAR <Arrow/></Link><Link className="button outline" href="/sessions">SESSIONS <Arrow/></Link></div>
   <p className="rounds-free">Free to spar. No payment to apply.</p>
  </div>
  <HeroBackground/>
 </section>
 <div className="rounds-benefits"><div className="shell"><span>CURATED PAIRINGS</span><span>REAL ROUNDS</span><span>PRO FILMING</span></div></div>
 <section className="editorial-section bone-section" id="experience"><div className="shell community-compact">
  <div><p className="eyebrow">THE COMMUNITY</p><h2>FIND YOUR PEOPLE.<br/>GET YOUR ROUNDS.</h2><p>We bring Los Angeles County and Orange County boxers together for controlled, coach-supervised sparring. You bring the work. We organize the pairing and capture it.</p><Link href="/gym" className="gym-compact"><Image src="/images/gym/PM-02-Ring-front.webp" width={160} height={107} sizes="100px" alt="Dalakian boxing ring"/><span>OUR HOME RING<br/><strong>Meet the gym &amp; Artem →</strong></span></Link></div>
  <div id="how"><p className="eyebrow">HOW IT WORKS</p><ol className="rounds-steps">{[['APPLY','Leave your details and boxing experience.'],['GET MATCHED','Our team finds a compatible partner.'],['SPAR','Confirm your spot. Show up ready.'],['KEEP THE ROUNDS','Add filmed rounds with the optional Content Pack.']].map(([title,copy],i)=><li key={title}><span className="mono">0{i+1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></div>
 </div></section>
 {next&&<section className="next-session-compact shell"><div><p className="eyebrow">NEXT SESSION</p><h2>{next.title}</h2><p>{next.date} · {next.location_name}, {next.city}</p></div><Link className="button red" href={`/apply?session=${next.id}`}>APPLY FOR THIS SESSION <Arrow/></Link></section>}
 <section className="editorial-section" id="pricing"><div className="shell pack-compact"><div><p className="eyebrow">OPTIONAL PRODUCTION</p><h2>KEEP THE FOOTAGE.</h2><p className="pack-price">$99 <small>PUNCH CONTENT PACK / FOUNDING PRICE</small></p><p>Your agreed sparring recording.<br/>One shared vertical highlights reel.</p><p>Three correction rounds. Delivered through Google Drive.</p><p className="fine">Optional, after your matchup is confirmed. Sparring stays free. Delivery date and scope confirmed before payment.</p><Link className="button outline" href="/content-pack">SEE WHAT’S INCLUDED →</Link></div><div><p className="eyebrow">YOUR FIGHTER PROFILE</p><ProfileCard/></div></div></section>
 <section className="editorial-section bone-section" id="services"><div className="shell"><p className="eyebrow">BEYOND THE SESSION</p><h2>YOUR BOXING. YOUR CONTENT.</h2><div className="service-card-grid"><article><p className="mono">01 / EDITING</p><h3>GOT FOOTAGE?</h3><p>A personal highlight or a separate social reel from your existing material. No event participation required.</p><Link className="button outline" href="/highlight-edit">GET A HIGHLIGHT →</Link><p className="fine">Quote after footage review.</p></article><article><p className="mono">02 / FILMING</p><h3>LET’S TELL YOUR STORY.</h3><p>Training, an interview, fight preparation or personal social content. Plan a shoot around you.</p><Link className="button outline" href="/private-shoot">REQUEST A SHOOT →</Link><p className="fine">Location, scope and price agreed individually.</p></article></div></div></section>
 <section className="home-questions bone-section" id="faq"><div className="shell"><details className="faq-group"><summary><span>QUESTIONS BEFORE THE BELL?</span><span className="faq-group-toggle" aria-hidden="true">+</span></summary><div className="faq-group-content">{faqs.map(([q,a])=><details className="faq-item" key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></details></div></section>
 <section className="editorial-section final-apply"><div className="shell final-compact"><div><p className="eyebrow">LOS ANGELES / PUNCH MENTALITY</p><h2>LESS TALK.<br/>MORE ROUNDS.</h2></div><Link className="button cream" href="/apply">APPLY TO SPAR <Arrow/></Link></div></section>
 <section className="home-updates bone-section" id="updates"><div className="shell"><details className="updates-disclosure"><summary>NOT READY TO SPAR? GET SESSION UPDATES <span aria-hidden="true">+</span></summary><UpdatesForm/></details></div></section>
 </>;
}
