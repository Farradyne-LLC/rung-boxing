"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const age = Number((form.elements.namedItem("age") as HTMLInputElement)?.value || 0);
    if (age < 18) {
      e.preventDefault();
      alert("The public Punch Mentality pilot is 18+.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top">PUNCH MENTALITY</a>
        <a className="navCta" href="#apply">APPLY FOR ROUNDS</a>
      </header>

      <section id="top" className="hero shell">
        <p className="eyebrow">LOS ANGELES · PRIVATE PILOT</p>
        <h1>GET MATCHED.<br/>GET ROUNDS.<br/><em>GET FILMED.</em></h1>
        <p className="lede">
          Coach-supervised sparring, professional footage and a permanent record of your progress.
        </p>
        <div className="actions">
          <a className="primary" href="#apply">Apply for a session</a>
          <a className="ghost" href="#how">How it works</a>
        </div>
        <p className="tape">PUT IT ON TAPE.</p>
      </section>

      <section className="statement">
        <div className="shell statementGrid">
          <span>THE IDEA</span>
          <div>
            <h2>Sparring should not disappear when the bell rings.</h2>
            <p>
              Punch Mentality turns quality rounds into something you can study, share and build on:
              full-session footage, highlights, coach feedback and a growing fighter portfolio.
            </p>
          </div>
        </div>
      </section>

      <section id="how" className="section shell">
        <div className="sectionTitle"><span>01</span><h2>HOW IT WORKS</h2></div>
        <div className="steps">
          <article><b>01 — APPLY</b><h3>Tell us how you box.</h3><p>Weight, stance, experience, gym, coach and real sparring background.</p></article>
          <article><b>02 — MATCH</b><h3>Coach-approved pairing.</h3><p>Weight and experience first. Then control, intensity, stance and fit.</p></article>
          <article><b>03 — ROUNDS</b><h3>Controlled sparring.</h3><p>Referee present. Headgear required. 16 oz default. No scorecards, no ego.</p></article>
          <article><b>04 — KEEP IT</b><h3>Your footage stays with you.</h3><p>Private, share-link or public only when the fighters approve it.</p></article>
        </div>
      </section>

      <section className="black">
        <div className="section shell">
          <div className="sectionTitle light"><span>02</span><h2>THE STANDARD</h2></div>
          <div className="rules">
            <div><h3>CONTROLLED FIRST.</h3><p>Technical sparring for the public product. Hard rounds are invitation-only and reserved for advanced/pro fighters.</p></div>
            <div><h3>COACH CLEARED.</h3><p>New fighters are checked before they are cleared to spar. If you are not ready, we point you toward training instead.</p></div>
            <div><h3>STOP MEANS STOP.</h3><p>The referee or either fighter can stop the session at any time. No pressure to continue.</p></div>
            <div><h3>NO WINNER. NO LOSER.</h3><p>This is sparring. We track activity, rounds and progress — not fake records.</p></div>
            <div><h3>REAL WEIGH-IN.</h3><p>Every session starts with an on-site weight check and final matchup approval.</p></div>
            <div><h3>YOUR FOOTAGE, YOUR CALL.</h3><p>Publishing requires consent. Serious amateurs and pros can keep sessions private and share them by link.</p></div>
          </div>
        </div>
      </section>

      <section className="section shell audience">
        <div className="sectionTitle"><span>03</span><h2>BUILT FOR PEOPLE WHO ACTUALLY TRAIN.</h2></div>
        <div className="audienceGrid">
          <p>
            You do not need a pro record. You do need enough boxing experience and control to spar responsibly.
          </p>
          <p>
            Recreational boxer, serious amateur or pro — the level changes. The standard does not.
          </p>
        </div>
      </section>

      <section id="apply" className="apply">
        <div className="shell applyGrid">
          <div className="applyIntro">
            <p className="eyebrow">PILOT APPLICATION</p>
            <h2>SHOW US WHERE YOUR BOXING IS RIGHT NOW.</h2>
            <p>We are keeping the first sessions small. Every application and matchup is reviewed manually.</p>
            <div className="pilotCard">
              <b>LOS ANGELES PILOT</b>
              <span>18+ public registration</span>
              <span>Bring your own gear</span>
              <span>Arrive 45–60 min early</span>
              <span>Coach/referee check-in required</span>
            </div>
          </div>

          {submitted ? (
            <div className="success">
              <p className="eyebrow">APPLICATION SENT</p>
              <h3>YOU'RE ON THE LIST.</h3>
              <p>We will review your profile and contact you if we have a safe match for the pilot.</p>
            </div>
          ) : (
          <form
            className="form"
            action="https://formsubmit.co/muveco@gmail.com"
            method="POST"
            onSubmit={onSubmit}
          >
            <input type="hidden" name="_subject" value="Punch Mentality — New Pilot Application" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />

            <h3>ABOUT YOU</h3>
            <div className="two">
              <label>Full name *<input name="name" required /></label>
              <label>Age *<input name="age" type="number" min="18" required /></label>
            </div>
            <div className="two">
              <label>Email *<input name="email" type="email" required /></label>
              <label>Phone<input name="phone" /></label>
            </div>
            <label>Instagram<input name="instagram" placeholder="@handle" /></label>

            <h3>BOXING PROFILE</h3>
            <div className="three">
              <label>Weight (lb) *<input name="weight" type="number" required /></label>
              <label>Height<input name="height" placeholder="5 ft 10 in" /></label>
              <label>Stance<select name="stance"><option>Orthodox</option><option>Southpaw</option><option>Switch</option></select></label>
            </div>
            <div className="two">
              <label>Years boxing *<input name="years_boxing" required /></label>
              <label>Amateur / pro fights<input name="fight_record" placeholder="e.g. 3 amateur / 0 pro" /></label>
            </div>
            <label>Sparring experience *<textarea name="sparring_experience" required placeholder="How often do you spar? What level of partners? Typical rounds?" /></label>
            <div className="two">
              <label>Home gym<input name="home_gym" /></label>
              <label>Coach<input name="coach" /></label>
            </div>
            <label>Fight / sparring video link<input name="video_link" placeholder="YouTube, Drive, Instagram…" /></label>

            <h3>YOUR SESSION</h3>
            <label>Availability<input name="availability" placeholder="Days / times that usually work" /></label>
            <label>Preferred intensity
              <select name="preferred_intensity">
                <option>Technical / Controlled</option>
                <option>Light Technical</option>
                <option>Coach decides</option>
              </select>
            </label>
            <label>What do you want to work on?<textarea name="session_goal" placeholder="Timing, defense, southpaws, pressure, ring movement…" /></label>

            <label className="check"><input type="checkbox" required /><span>I confirm I am 18 or older.</span></label>
            <label className="check"><input type="checkbox" required /><span>I understand final participation is subject to coach approval and on-site check-in.</span></label>

            <button className="submit" type="submit">SUBMIT PILOT APPLICATION</button>
            <p className="fine">This pilot application is not a medical clearance or a guarantee of a sparring match.</p>
          </form>
          )}
        </div>
      </section>

      <footer className="footer shell">
        <b>PUNCH MENTALITY</b>
        <span>LOS ANGELES · CONTROLLED SPARRING · PROFESSIONAL FOOTAGE</span>
      </footer>
    </main>
  );
}