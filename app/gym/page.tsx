import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Gym — Punch Mentality',
  description: 'Inside Dalakian Elite Boxing & Fitness. The ring, Artem and the everyday work behind the rounds.',
};

const gymPhotos = [
  ['PM-03-Gym-overview', 'The training floor', 'Training floor with heavy bags beside the boxing ring'],
  ['PM-04-Heavy-bags', 'Put in the work', 'Row of Dalakian heavy bags'],
  ['PM-05-Speed-bag', 'The details', 'Close-up of a speed bag inside the gym'],
  ['PM-06-Boxing-mural', 'Boxing on the walls', 'Boxing mural and trophies inside the gym'],
];
const trainingPhotos = [
  ['DSC06785', 'Between the rounds', 'Boxer practicing his stance beside the ring'],
  ['DSC06802', 'People of the gym', 'Training portrait beside a heavy bag'],
  ['DSC06821', 'At the gym', 'Boxing portrait on the training floor'],
  ['DSC06826', 'Shared work', 'Two boxers posing together after training'],
  ['DSC06840', 'The training room', 'Three people posing in boxing stances inside the gym'],
  ['DSC06845', 'One room. Shared discipline.', 'Group portrait beside the heavy bags'],
];

export default function GymPage() {
  return <div className="gym-page">
    <section className="gym-cover">
      <Image src="/images/gym/PM-08-Ring-low-angle.webp" alt="Low-angle view through the ropes of the Dalakian boxing ring" fill priority sizes="100vw" />
      <div className="shell gym-cover-copy"><p className="eyebrow">PUNCH MENTALITY / INSIDE THE GYM</p><h1>WHERE THE<br/>WORK HAPPENS.</h1><p>Dalakian Elite Boxing &amp; Fitness</p><a className="button outline" href="#training">EXPLORE THE TRAINING</a></div>
    </section>
    <section className="editorial-section bone-section"><div className="shell gym-story"><div><p className="eyebrow">01 / THE SPACE</p><h2>THE RING.<br/>THE ROUTINE.</h2><p>A closer look at the place behind the photographs: the ring, the bags and the space where rounds begin.</p><p>Boxing is built through repeated work. Footwork, timing, attention and another day in the gym.</p></div><Image src="/images/gym/PM-02-Ring-front.webp" width={2200} height={1467} alt="Front view of the Dalakian boxing ring" sizes="(max-width: 760px) 92vw, 55vw" /></div></section>
    <section className="editorial-section"><div className="shell"><div className="gym-photo-grid">{gymPhotos.map(([file,caption,alt])=><figure key={file}><Image src={`/images/gym/${file}.webp`} width={2200} height={1467} alt={alt} sizes="(max-width: 760px) 92vw, 45vw"/><figcaption>{caption}</figcaption></figure>)}</div></div></section>
    <section className="editorial-section bone-section" id="artem"><div className="shell gym-story"><Image src="/images/gym/PM-07-Artem.webp" width={2200} height={1467} alt="Artem outside Dalakian Elite Boxing & Fitness" sizes="(max-width: 760px) 92vw, 55vw"/><div><p className="eyebrow">02 / THE PEOPLE</p><h2>ARTEM.<br/>AT THE GYM.</h2><p>The people make the room. Artem, photographed outside Dalakian Elite Boxing &amp; Fitness, is part of this look inside the gym.</p><p>Step inside through the training photographs below.</p><a className="text-link" href="#training">SEE THE TRAINING ↓</a></div></div></section>
    <section className="editorial-section" id="training"><div className="shell"><p className="eyebrow">03 / TRAINING JOURNAL</p><h2>REAL PEOPLE.<br/>EVERYDAY ROUNDS.</h2><p className="section-lead">Moments from the training floor. The preparation, the people and the work between rounds.</p><div className="gym-photo-grid training-gallery">{trainingPhotos.map(([file,caption,alt],i)=><figure key={file} className={i>=4?'landscape':''}><a href={`/images/gym/${file}.webp`} target="_blank" rel="noreferrer" aria-label={`Open photograph: ${caption}`}><Image src={`/images/gym/${file}.webp`} width={i>=4?1800:1335} height={i>=4?1202:2000} alt={alt} sizes="(max-width: 760px) 92vw, 45vw"/></a><figcaption>{caption}</figcaption></figure>)}</div></div></section>
    <section className="editorial-section bone-section"><div className="shell"><p className="eyebrow">PUNCH MENTALITY</p><h2>BRING YOUR WORK<br/>TO THE RING.</h2><p>Apply for a curated technical sparring session. Pairings and session details are confirmed individually.</p><Link href="/apply" className="button red">APPLY TO SPAR →</Link></div></section>
  </div>;
}
