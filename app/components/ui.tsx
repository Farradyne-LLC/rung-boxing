import Link from "next/link";
export function Arrow() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 12h15M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
export function SectionLabel({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <p className="section-label mono">
      <span>{number}</span>
      {text}
    </p>
  );
}
export function ProfileCard() {
  return (
    <article className="profile-card">
      <div className="profile-card-head">
        <span className="mono">FIGHTER PORTFOLIO</span>
        <span className="pill">SAMPLE PROFILE</span>
      </div>
      <div className="profile-identity">
        <div className="avatar" aria-hidden="true">
          PM
        </div>
        <div>
          <span className="small-tag">YOUR STORY IN ROUNDS</span>
          <h3>YOUR NAME.</h3>
          <p>Weight · Stance · Home gym</p>
        </div>
      </div>
      <div className="profile-stats">
        <div>
          <strong>—</strong>
          <span>SESSIONS</span>
        </div>
        <div>
          <strong>—</strong>
          <span>ROUNDS</span>
        </div>
        <div>
          <strong>—</strong>
          <span>RECORDED</span>
        </div>
      </div>
      <div className="profile-entry">
        <span className="session-icon">01</span>
        <div>
          <b>YOUR FIRST CHAPTER</b>
          <p>Your completed session will appear here.</p>
        </div>
        <Arrow />
      </div>
      <div className="profile-card-bottom">
        <span>REAL PARTICIPATION. LASTING HISTORY.</span>
        <Link href="/fighters/demo" aria-label="Explore sample fighter profile">
          <Arrow />
        </Link>
      </div>
    </article>
  );
}
export const faqItems = [
  [
    "Is sparring really free?",
    "Yes. Approved participation is free during the pilot. Applications are reviewed, and participation depends on an appropriate pairing and coach approval.",
  ],
  [
    "Do I have to buy the content package?",
    "No. The optional $69 test offer includes recorded sparring, one personal highlight and a fighter portfolio entry. Buying content never affects eligibility or priority. Scope and delivery details will be confirmed before payment.",
  ],
  [
    "Does applying guarantee me a partner?",
    "No. Every application is reviewed by a person. We consider your experience, weight, control, availability and the available partners. Your session is only booked after explicit confirmation.",
  ],
  [
    "Do I need amateur fights?",
    "No. You do need sufficient boxing and sparring experience to participate responsibly. Your coach and our review team help establish whether a suitable pairing is available.",
  ],
  [
    "Is it 18+?",
    "Standard participation is 18+. Under-18 applications require individual review and a separate guardian procedure. They cannot be confirmed until that procedure is in place. Youth profiles remain private.",
  ],
  [
    "What equipment do I need?",
    "Bring headgear, a mouthguard, wraps, groin protection and suitable gloves. The default is 16 oz; 14 oz requires coach approval. Equipment and actual weight are checked on arrival.",
  ],
  [
    "Will my profile and footage be public?",
    "Adults initially see Public selected and can choose Private. This preference is not publication consent. Permissions for your profile, website footage, social media, YouTube and advertising are separate. Shared footage is not published without the required permissions from both fighters.",
  ],
  [
    "Where and when are the next rounds?",
    "We are starting in Los Angeles County and Orange County. The next date and venue have not been confirmed. Sign up for updates or leave a general application when registration opens.",
  ],
];
export function Faq() {
  return (
    <div className="faq-list">
      {faqItems.map(([q, a], i) => (
        <details key={q}>
          <summary>
            <span className="faq-number">0{i + 1}</span>
            {q}
            <span className="faq-plus" aria-hidden="true">
              +
            </span>
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
export function FootageCards() {
  return (
    <div className="footage-grid">
      <article className="footage-card full-rounds">
        <div className="footage-top mono">
          <span>01 / FULL SPARRING</span>
          <span>CONTENT PREVIEW</span>
        </div>
        <div className="media-empty">
          <span className="media-symbol" aria-hidden="true">
            ▤
          </span>
          <p>
            EVERY ROUND.
            <br />
            THE WHOLE PICTURE.
          </p>
          <span>Approved event footage coming soon</span>
        </div>
        <div className="footage-bottom">
          <div>
            <h3>FULL ROUNDS</h3>
            <p>Watch back. Study your work.</p>
          </div>
          <span className="pill">AWAITING FOOTAGE</span>
        </div>
      </article>
      <article className="footage-card highlight-card">
        <div className="footage-top mono">
          <span>02 / PERSONAL EDIT</span>
          <span>OPTIONAL $69 PACKAGE</span>
        </div>
        <div className="media-empty">
          <span className="media-symbol" aria-hidden="true">
            ▷
          </span>
          <p>
            YOUR WORK.
            <br />
            YOUR HIGHLIGHT.
          </p>
          <span>One personal edit, built around your session</span>
        </div>
        <div className="footage-bottom">
          <div>
            <h3>PERSONAL HIGHLIGHT</h3>
            <p>Movement. Timing. Technique.</p>
          </div>
          <span className="pill">COMING SOON</span>
        </div>
      </article>
    </div>
  );
}
