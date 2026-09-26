import HeroBackground from "./components/hero-background";
import Link from "next/link";
import {
  Arrow,
  SectionLabel,
  ProfileCard,
  Faq,
  FootageCards,
} from "./components/ui";
import UpdatesForm from "./components/updates-form";

export default function Home() {
  return (
    <>
      <section className="hero" id="top">
        <HeroBackground />
        <div className="hero-shade" />
        <div className="shell hero-inner">
          <div className="hero-kicker mono">
            <span className="red-rule" /> LOS ANGELES + ORANGE COUNTY{" "}
            <span className="hero-kicker-end">PREMIUM SPARRING CULTURE</span>
          </div>
          <div className="hero-copy">
            <h1>
              REAL ROUNDS.
              <br />
              REAL FOOTAGE.
              <br />
              <span>REAL PROGRESS.</span>
            </h1>
            <p>
              For people who actually box.
              <br />
              Organized rounds. Coach-reviewed pairings.
              <br />A body of work that stays with you.
            </p>
            <div className="actions">
              <Link className="button red" href="/apply">
                APPLY TO SPAR <Arrow />
              </Link>
              <a className="button outline" href="#updates">
                GET UPDATES <Arrow />
              </a>
            </div>
            <div className="hero-offers">
              <span>
                SPARRING <b>FREE</b>
              </span>
              <span>
                OPTIONAL CONTENT <b>$69</b>
              </span>
            </div>
            <p className="hero-note">
              Pilot pricing. Participation subject to review.
            </p>
          </div>
          <div className="hero-bottom mono">
            <span>TRAIN / SPAR / PROGRESS / BELONG</span>
            <span>GENERATED BRAND VISUAL</span>
          </div>
        </div>
      </section>
      <div className="principles-strip">
        <div className="shell">
          <span>COACH SUPERVISED</span>
          <span>HEADGEAR REQUIRED</span>
          <span>NO SCORECARDS. JUST WORK.</span>
          <span>EVERY ROUND COUNTS.</span>
        </div>
      </div>
      <section id="updates" className="updates-strip">
        <div className="shell updates-grid">
          <div>
            <p className="eyebrow">STAY IN THE CORNER</p>
            <h2>
              THE NEXT ROUNDS.
              <br />
              IN YOUR INBOX.
            </h2>
          </div>
          <UpdatesForm />
        </div>
      </section>
      <section className="section bone" id="experience">
        <div className="shell">
          <SectionLabel number="01" text="THE EXPERIENCE" />
          <div className="section-heading">
            <h2>
              MORE THAN
              <br />
              <span className="red-text">ROUNDS.</span>
            </h2>
            <p>
              You put in the work. Make it count.
              <br />
              Every application includes a fighter profile.
              <br className="desktop-only" /> Add the footage if you want it.
            </p>
          </div>
          <div className="value-grid">
            {[
              [
                "01",
                "SPAR.",
                "FREE DURING THE PILOT",
                "Real rounds with an appropriate partner. Reviewed by people who know boxing.",
                "⌑",
              ],
              [
                "02",
                "GET FILMED.",
                "OPTIONAL CONTENT PACKAGE",
                "Your recorded sparring. The space to watch back, learn and see your work.",
                "▤",
              ],
              [
                "03",
                "KEEP THE WORK.",
                "OPTIONAL CONTENT PACKAGE",
                "One personal highlight. An edit that captures your movement, timing and technique.",
                "▷",
              ],
              [
                "04",
                "BUILD A PROFILE.",
                "PROFILE WITH EVERY APPLICATION",
                "Your sessions and approved footage, together in a growing fighter portfolio.",
                "▣",
              ],
            ].map(([n, title, tag, copy, icon]) => (
              <article className="value-card" key={n}>
                <div className="value-top">
                  <span className="mono">{n}</span>
                  <span className="line-icon" aria-hidden="true">
                    {icon}
                  </span>
                </div>
                <h3>{title}</h3>
                <span className="small-tag">{tag}</span>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section" id="how">
        <div className="shell">
          <SectionLabel number="02" text="HOW IT WORKS" />
          <div className="section-heading">
            <h2>
              SHOW UP READY.
              <br />
              WE’LL HANDLE THE ROUNDS.
            </h2>
            <p>
              No instant matches. Every pairing gets a human review and final
              coach approval.
            </p>
          </div>
          <div className="steps-grid">
            {[
              [
                "APPLY",
                "Tell us your weight, experience, gym and availability.",
              ],
              [
                "REVIEW",
                "We look for a suitable pairing, based on more than weight.",
              ],
              [
                "GET CONFIRMED",
                "Receive session details if an appropriate match is available.",
              ],
              [
                "SPAR",
                "Check in, weigh in, gear up. Controlled, supervised rounds.",
              ],
              [
                "BUILD YOUR PORTFOLIO",
                "Choose the optional content package to keep your footage and highlight.",
              ],
            ].map(([title, text], i) => (
              <article key={title}>
                <span className="step-number">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="section-end">
            <p>
              Applying is the first step. It does not guarantee a partner or a
              place.
            </p>
            <Link href="/apply" className="text-link">
              APPLY TO SPAR <Arrow />
            </Link>
          </div>
        </div>
      </section>
      <section className="section footage-section" id="footage">
        <div className="shell">
          <SectionLabel number="03" text="THE BODY OF WORK" />
          <div className="section-heading">
            <h2>
              THE BELL RINGS.
              <br />
              <span className="red-text">THE WORK STAYS.</span>
            </h2>
            <p>
              Full rounds to study. A personal edit to keep.
              <br />
              This is what the optional content package is built around.
            </p>
          </div>
          <FootageCards />
          <p className="caption">
            Content preview. Event footage will appear here after delivery and
            publication approval.
          </p>
        </div>
      </section>
      <section className="section bone" id="portfolio">
        <div className="shell portfolio-grid">
          <div>
            <SectionLabel number="04" text="YOUR FIGHTER PORTFOLIO" />
            <h2>
              BUILD YOUR
              <br />
              BODY OF WORK.
            </h2>
            <p className="section-copy">
              More than a bio. A record of showing up.
            </p>
            <p>
              Your rounds, sessions and approved content come together in one
              place. Something to study. Something to build on. Something you
              can choose to share.
            </p>
            <ul className="clean-list">
              <li>Sessions and recorded rounds</li>
              <li>Full footage and personal highlights</li>
              <li>A simple Public / Private choice</li>
            </ul>
            <Link href="/fighters/demo" className="button black">
              EXPLORE SAMPLE PROFILE <Arrow />
            </Link>
          </div>
          <ProfileCard />
        </div>
      </section>
      <section className="section" id="pricing">
        <div className="shell">
          <SectionLabel number="05" text="STRAIGHTFORWARD PRICING" />
          <div className="section-heading">
            <h2>
              FREE ROUNDS.
              <br />
              YOUR CONTENT IS OPTIONAL.
            </h2>
            <p>
              Come for the work.
              <br />
              Pay for the content only if you want it.
            </p>
          </div>
          <div className="pricing-grid">
            <article className="price-card">
              <div className="price-top">
                <span className="mono">THE ROUNDS</span>
                <span className="pill">PILOT OFFER</span>
              </div>
              <h3>SPARRING SESSION</h3>
              <div className="price">
                $0<span>APPROVED PARTICIPATION</span>
              </div>
              <ul className="clean-list">
                <li>Application and matchup review</li>
                <li>Organized, coach-supervised rounds</li>
                <li>On-site weigh-in and gear check</li>
              </ul>
              <Link href="/apply" className="button outline">
                APPLY TO SPAR <Arrow />
              </Link>
            </article>
            <article className="price-card content-price">
              <div className="price-top">
                <span className="mono">THE CONTENT</span>
                <span className="pill">OPTIONAL</span>
              </div>
              <h3>PERSONAL CONTENT PACKAGE</h3>
              <div className="price">
                $69<span>TEST PRICE · DETAILS TO BE CONFIRMED</span>
              </div>
              <ul className="clean-list">
                <li>Recorded sparring</li>
                <li>One personal highlight</li>
                <li>Fighter portfolio entry</li>
              </ul>
              <Link href="/apply?content=yes" className="button red">
                INTERESTED IN CONTENT <Arrow />
              </Link>
            </article>
          </div>
          <p className="pricing-note">
            Content purchase does not affect sparring eligibility. No payment is
            collected in this preview. Package scope and delivery details will
            be confirmed before any sale.
          </p>
        </div>
      </section>
      <section className="section standard-section">
        <div className="shell standard-grid">
          <div>
            <SectionLabel number="06" text="THE STANDARD" />
            <h2>
              CONTROLLED ROUNDS.
              <br />
              HIGHER STANDARDS.
            </h2>
          </div>
          <div className="standards">
            <article>
              <h3>COACH CLEARED.</h3>
              <p>
                Every pairing is reviewed. Actual weigh-in and a readiness check
                happen on arrival.
              </p>
            </article>
            <article>
              <h3>GEAR UP.</h3>
              <p>
                Headgear required. 16 oz gloves by default; 14 oz only with
                coach approval.
              </p>
            </article>
            <article>
              <h3>STOP MEANS STOP.</h3>
              <p>
                Either fighter or the referee can stop the session. No
                scorecards. No winners or losers.
              </p>
            </article>
            <article>
              <h3>YOUR VISIBILITY. YOUR CHOICE.</h3>
              <p>
                One agreement. Public or Private visibility. Your profile is
                part of registration; private footage stays out of public
                channels.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="section next-section" id="next">
        <div className="shell next-grid">
          <div>
            <SectionLabel number="07" text="NEXT OPEN RING" />
            <h2>
              THE NEXT CHAPTER.
              <br />
              COMING SOON.
            </h2>
            <p>
              Los Angeles County + Orange County.
              <br />
              The next session date and gym will be announced once confirmed.
            </p>
            <a href="#updates" className="button red">
              GET UPDATES <Arrow />
            </a>
          </div>
          <div className="event-ticket">
            <span className="mono">PUNCH MENTALITY / OPEN RING</span>
            <h3>NEXT SESSION</h3>
            <div className="ticket-row">
              <span>DATE</span>
              <b>To be announced</b>
            </div>
            <div className="ticket-row">
              <span>LOCATION</span>
              <b>To be confirmed</b>
            </div>
            <div className="ticket-row">
              <span>STATUS</span>
              <b>Awaiting announcement</b>
            </div>
            <Link href="/sessions/next" className="text-link">
              SESSION INFORMATION <Arrow />
            </Link>
          </div>
        </div>
      </section>
      <section className="section bone" id="faq">
        <div className="shell faq-grid">
          <div>
            <SectionLabel number="08" text="BEFORE YOU APPLY" />
            <h2>
              GOOD
              <br />
              QUESTIONS.
            </h2>
          </div>
          <Faq />
        </div>
      </section>
      <section className="final-cta">
        <div className="shell">
          <p className="mono">TRAIN. SPAR. PROGRESS. BELONG.</p>
          <h2>
            EVERY ROUND
            <br />
            <span>COUNTS.</span>
          </h2>
          <Link href="/apply" className="button bone-button">
            APPLY TO SPAR <Arrow />
          </Link>
          <p>LOS ANGELES + ORANGE COUNTY</p>
        </div>
      </section>
    </>
  );
}
