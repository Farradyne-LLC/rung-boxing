"use client";

import { FormEvent, useState } from "react";

const levels = [
  { code: "01", title: "Foundation", rounds: "3 × 2", note: "Newer sparring experience" },
  { code: "02", title: "Standard", rounds: "3 × 3", note: "Experienced recreational / amateur" },
  { code: "03", title: "Competitive", rounds: "4 × 3", note: "Coach approval required" },
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  function nextStep(e: FormEvent) {
    e.preventDefault();
    const form = (e.currentTarget as HTMLElement).closest("form");
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
      <div className="pilotBar">
        <div className="shell pilotInner">
          <span>LOS ANGELES PILOT / 001</span>
          <span>DALAKYAN GYM</span>
          <a href="#apply">APPLY FOR ROUNDS ↗</a>
        </div>
      </div>

      <header className="nav shell">
        <a className="wordmark" href="#top">PUNCH<br/>MENTALITY</a>
        <nav className="navLinks" aria-label="Primary">
          <a href="#system">SYSTEM</a>
          <a href="#profile">PROFILE</a>
          <a href="#standard">STANDARD</a>
        </nav>
        <a className="navCta" href="#apply">JOIN THE PILOT</a>
      </header>

      <section id="top" className="hero shell">
        <div className="heroCopy">
          <div className="kicker">DIGITAL BOXING CLUB / SPARRING NETWORK</div>
          <h1>
            REAL ROUNDS.<br/>
            <span>REAL FOOTAGE.</span><br/>
            REAL PROGRESS.
          </h1>
          <p className="heroLead">
            Get matched by level and weight, spar under coach supervision, and leave with footage you can study, share, and keep building on.
          </p>
          <div className="heroActions">
            <a className="button buttonLime" href="#apply">APPLY FOR A SESSION</a>
            <a className="button buttonGhost" href="#system">SEE THE SYSTEM</a>
          </div>
        </div>

        <div className="heroBoard" aria-label="Punch Mentality sample session card">
          <div className="boardTop">
            <span>SESSION / 001</span>
            <span>CONTROLLED</span>
          </div>
          <div className="boardVs">
            <div>
              <small>FIGHTER A</small>
              <strong>176</strong>
              <span>LB / ORTHODOX</span>
            </div>
            <b>VS</b>
            <div>
              <small>FIGHTER B</small>
              <strong>173</strong>
              <span>LB / SOUTHPAW</span>
            </div>
          </div>
          <div className="boardMeta">
            <span>3 × 3 MIN</span>
            <span>COACH APPROVED</span>
            <span>2 CAMERA MIN.</span>
          </div>
          <div className="ringLines" aria-hidden="true"><i/><i/><i/></div>
        </div>
      </section>

      <section className="thesis">
        <div className="shell thesisGrid">
          <div className="indexLabel">WHY / 01</div>
          <div>
            <p className="displayQuote">
              SPARRING SHOULD NOT DISAPPEAR WHEN THE BELL RINGS.
            </p>
            <p className="thesisText">
              Most boxers train for years and still have no clean record of how they actually look in the ring. Punch Mentality turns every approved sparring session into a usable asset: full rounds, highlights, coach feedback, and a growing fighter profile.
            </p>
          </div>
        </div>
      </section>

      <section id="system" className="section shell">
        <div className="sectionHeader">
          <div className="indexLabel">SYSTEM / 02</div>
          <h2>FROM “I NEED ROUNDS” TO A SESSION ON YOUR PROFILE.</h2>
        </div>

        <div className="processGrid">
          <article className="processCard cobalt">
            <span>01</span>
            <h3>APPLY</h3>
            <p>Weight, stance, experience, gym, coach, sparring history and video if you have it.</p>
          </article>
          <article className="processCard bone">
            <span>02</span>
            <h3>MATCH</h3>
            <p>Weight and experience are the hard filters. Final pairing is coach-approved.</p>
          </article>
          <article className="processCard blackCard">
            <span>03</span>
            <h3>SPAR</h3>
            <p>Controlled rounds. Referee present. Headgear required. 16 oz by default.</p>
          </article>
          <article className="processCard lime">
            <span>04</span>
            <h3>KEEP IT</h3>
            <p>Full session, selected clips, feedback, and a permanent entry in your boxing history.</p>
          </article>
        </div>
      </section>

      <section className="formatStrip">
        <div className="shell">
          <div className="sectionHeader compact">
            <div className="indexLabel">FORMAT / 03</div>
            <h2>THE LEVEL CHANGES. THE STANDARD DOES NOT.</h2>
          </div>
          <div className="levelGrid">
            {levels.map((level) => (
              <div className="levelCard" key={level.code}>
                <span className="levelCode">{level.code}</span>
                <div>
                  <h3>{level.title}</h3>
                  <p>{level.note}</p>
                </div>
                <strong>{level.rounds}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="profile" className="profileSection">
        <div className="shell profileGrid">
          <div className="profileCopy">
            <div className="indexLabel">PROFILE / 04</div>
            <h2>DON’T SAY YOU BOX.<br/>SHOW THE WORK.</h2>
            <p>
              No fake win-loss record for sparring. Your profile shows activity, experience, rounds, styles faced, footage, and coach-reviewed sessions.
            </p>
            <div className="privacyList">
              <span>PRIVATE</span>
              <span>SHARE LINK</span>
              <span>HIGHLIGHTS OK</span>
              <span>PUBLIC — BOTH APPROVE</span>
            </div>
          </div>

          <div className="fighterCard">
            <div className="fighterTop">
              <div>
                <small>FIGHTER PROFILE</small>
                <h3>ANTHONY<br/>M.</h3>
              </div>
              <div className="verify">COACH<br/>VERIFIED</div>
            </div>
            <div className="fighterStats">
              <div><span>WEIGHT</span><strong>175 LB</strong></div>
              <div><span>STANCE</span><strong>ORTHODOX</strong></div>
              <div><span>SESSIONS</span><strong>08</strong></div>
              <div><span>ROUNDS</span><strong>26</strong></div>
            </div>
            <div className="tapeRow">
              <span>LAST SESSION</span>
              <strong>SEP 19 / 3 × 3 / CONTROLLED</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="standard" className="standard section shell">
        <div className="sectionHeader">
          <div className="indexLabel">STANDARD / 05</div>
          <h2>NO EGO. NO SCORECARDS. NO RANDOM MATCHUPS.</h2>
        </div>

        <div className="standardGrid">
          <article><span>01</span><h3>COACH CHECK-IN</h3><p>New fighters are evaluated before they are cleared for live rounds.</p></article>
          <article><span>02</span><h3>REAL WEIGH-IN</h3><p>We check actual weight on session day before final matchup approval.</p></article>
          <article><span>03</span><h3>CONTROLLED INTENSITY</h3><p>Technical sparring for the public product. Hard rounds are pro/invite only.</p></article>
          <article><span>04</span><h3>STOP MEANS STOP</h3><p>Referee or fighter can end the session immediately. No pressure to continue.</p></article>
          <article><span>05</span><h3>HEADGEAR REQUIRED</h3><p>16 oz is the default. 14 oz only with coach approval.</p></article>
          <article><span>06</span><h3>CONSENT BUILT IN</h3><p>Footage is not public by default. Publishing requires approval.</p></article>
        </div>
      </section>

      <section className="coach">
        <div className="shell coachGrid">
          <div className="coachStamp">COACH<br/>REVIEW</div>
          <div>
            <div className="indexLabel lightLabel">AFTER THE ROUNDS / 06</div>
            <h2>YOU DON’T JUST GET THE VIDEO. YOU GET THE READ.</h2>
            <p>
              Every pilot session ends with direct feedback from the coaching team: what worked, what broke down, and what to train before the next rounds.
            </p>
            <blockquote>
              “Your jab is getting you in. Your exit is getting you caught.”
            </blockquote>
          </div>
        </div>
      </section>

      <section id="apply" className="apply">
        <div className="shell applyGrid">
          <div className="applyIntro">
            <div className="indexLabel">APPLY / 07</div>
            <h2>GET ON THE<br/>PILOT LIST.</h2>
            <p>
              Los Angeles. 18+ public pilot. Bring your own gear. Arrive 45–60 minutes early for weigh-in, coach check and final pairing.
            </p>
            <div className="applyNote">
              <b>YOU DO NOT NEED A PRO RECORD.</b>
              <span>You do need enough experience and control to spar responsibly.</span>
            </div>
          </div>

          {submitted ? (
            <div className="successPanel">
              <span className="successCode">APPLICATION / RECEIVED</span>
              <h3>YOU’RE ON THE LIST.</h3>
              <p>We’ll review your boxing profile manually and contact you when we have a safe match.</p>
            </div>
          ) : (
            <form
              className="formPanel"
              action="https://formsubmit.co/muveco@gmail.com"
              method="POST"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="_subject" value="Punch Mentality — New Pilot Application" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_captcha" value="false" />

              <div className="formProgress">
                <span className={step >= 1 ? "active" : ""}>01 PROFILE</span>
                <span className={step >= 2 ? "active" : ""}>02 BOXING</span>
                <span className={step >= 3 ? "active" : ""}>03 SESSION</span>
              </div>

              <div className={step === 1 ? "formStep activeStep" : "formStep"}>
                <h3>WHO ARE YOU?</h3>
                <div className="two">
                  <label>FULL NAME *<input name="name" required /></label>
                  <label>AGE *<input name="age" type="number" min="18" required /></label>
                </div>
                <div className="two">
                  <label>EMAIL *<input name="email" type="email" required /></label>
                  <label>PHONE<input name="phone" /></label>
                </div>
                <label>INSTAGRAM<input name="instagram" placeholder="@handle" /></label>
                <button className="stepButton" onClick={nextStep}>CONTINUE →</button>
              </div>

              <div className={step === 2 ? "formStep activeStep" : "formStep"}>
                <h3>HOW DO YOU BOX?</h3>
                <div className="three">
                  <label>WEIGHT / LB *<input name="weight" type="number" required /></label>
                  <label>HEIGHT<input name="height" placeholder="5 ft 10 in" /></label>
                  <label>STANCE
                    <select name="stance">
                      <option>Orthodox</option>
                      <option>Southpaw</option>
                      <option>Switch</option>
                    </select>
                  </label>
                </div>
                <div className="two">
                  <label>YEARS BOXING *<input name="years_boxing" required /></label>
                  <label>AMATEUR / PRO FIGHTS<input name="fight_record" placeholder="e.g. 3 amateur / 0 pro" /></label>
                </div>
                <label>SPARRING EXPERIENCE *<textarea name="sparring_experience" required placeholder="How often do you spar? Typical rounds? What level of partners?" /></label>
                <div className="two">
                  <label>HOME GYM<input name="home_gym" /></label>
                  <label>COACH<input name="coach" /></label>
                </div>
                <label>FIGHT / SPARRING VIDEO<input name="video_link" placeholder="YouTube, Drive, Instagram…" /></label>
                <div className="formButtons">
                  <button type="button" className="backButton" onClick={() => setStep(1)}>← BACK</button>
                  <button className="stepButton" onClick={nextStep}>CONTINUE →</button>
                </div>
              </div>

              <div className={step === 3 ? "formStep activeStep" : "formStep"}>
                <h3>WHAT KIND OF ROUNDS?</h3>
                <label>AVAILABILITY<input name="availability" placeholder="Days / times that usually work" /></label>
                <label>PREFERRED INTENSITY
                  <select name="preferred_intensity">
                    <option>Technical / Controlled</option>
                    <option>Light Technical</option>
                    <option>Coach decides</option>
                  </select>
                </label>
                <label>WHAT DO YOU WANT TO WORK ON?<textarea name="session_goal" placeholder="Timing, defense, southpaws, pressure, ring movement…" /></label>
                <label>CONTENT PREFERENCE
                  <select name="content_preference">
                    <option>Private by default</option>
                    <option>Share-link is fine</option>
                    <option>Highlights can be public if both fighters approve</option>
                    <option>Full session can be public if both fighters approve</option>
                  </select>
                </label>
                <label className="check"><input type="checkbox" name="age_confirmed" required /><span>I confirm I am 18 or older.</span></label>
                <label className="check"><input type="checkbox" name="gear_confirmed" required /><span>I will bring required boxing gear: headgear, mouthguard, wraps, groin protection and gloves.</span></label>
                <label className="check"><input type="checkbox" name="coach_approval" required /><span>I understand final participation and pairing are subject to coach approval and on-site check-in.</span></label>
                <div className="formButtons">
                  <button type="button" className="backButton" onClick={() => setStep(2)}>← BACK</button>
                  <button className="submitButton" type="submit">SUBMIT APPLICATION ↗</button>
                </div>
                <p className="finePrint">Application does not guarantee a match and is not medical clearance.</p>
              </div>
            </form>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="shell footerGrid">
          <div className="footerMark">PUNCH<br/>MENTALITY</div>
          <div>
            <span>DIGITAL BOXING CLUB</span>
            <span>LOS ANGELES / 2026</span>
          </div>
          <a href="#top">BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>
  );
}
