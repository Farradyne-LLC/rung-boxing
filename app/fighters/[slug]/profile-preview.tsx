"use client";
import { useState } from "react";
import Link from "next/link";
import { ProfileCard, Arrow } from "../../components/ui";
export default function ProfilePreview() {
  const [visibility, setVisibility] = useState("Public");
  const [tab, setTab] = useState("Sessions");
  const [message, setMessage] = useState("");
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage(
        "Sample profile link copied. This link contains no personal fighter information.",
      );
    } catch {
      setMessage(`Copy this sample link: ${window.location.href}`);
    }
  }
  return (
    <>
      <div className="notice blue-notice">
        <strong>Portfolio demonstration</strong>Visibility controls below show
        how public and private states will look. They do not change or secure a
        real account.
      </div>
      <div className="visibility-controls">
        <label>
          Preview visibility
          <select
            value={visibility}
            onChange={(e) => {
              setVisibility(e.target.value);
              setMessage("");
            }}
          >
            <option>Public</option>
            <option>Private</option>
          </select>
        </label>
        {visibility === "Public" && (
          <button className="button outline" onClick={share}>
            SHARE SAMPLE PROFILE <Arrow />
          </button>
        )}
      </div>
      {message && (
        <p className="share-message" role="status">
          {message}
        </p>
      )}
      {visibility === "Private" ? (
        <div className="empty-panel">
          <p className="eyebrow">PRIVATE PROFILE · VISITOR VIEW DEMO</p>
          <h2>THIS WORK STAYS PRIVATE.</h2>
          <p>
            Profile details and footage would not be available to public
            visitors. A live private portfolio requires verified, authorized
            access.
          </p>
          <button
            className="button outline"
            onClick={() => setVisibility("Public")}
          >
            VIEW PUBLIC EXAMPLE <Arrow />
          </button>
        </div>
      ) : (
        <div className="product-grid">
          <ProfileCard />
          <div>
            <div className="sample-tabs" aria-label="Portfolio views">
              {["Sessions", "Footage", "About"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  aria-pressed={tab === t}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab === "Sessions" ? (
              <div className="product-panel">
                <p className="eyebrow">ACTIVITY, NOT A FIGHT RECORD</p>
                <h2>YOUR FIRST CHAPTER.</h2>
                <p>
                  Completed rounds are recorded whether or not you purchase
                  content. Recorded rounds are counted separately, when footage
                  exists.
                </p>
                <p>This empty sample makes no claims about a real fighter.</p>
                <Link href="/sessions/demo/rounds/sample" className="text-link">
                  EXPLORE A SESSION LAYOUT <Arrow />
                </Link>
              </div>
            ) : tab === "Footage" ? (
              <div className="product-panel">
                <h2>NO FOOTAGE YET.</h2>
                <p>
                  Delivered recordings and approved highlights will appear here.
                  Private material will never be exposed through a public
                  profile.
                </p>
                <Link className="text-link" href="/#footage">
                  EXPLORE THE CONTENT OFFER <Arrow />
                </Link>
              </div>
            ) : (
              <div className="product-panel">
                <h2>THE BOXER BEHIND THE ROUNDS.</h2>
                <p>
                  Display name, weight, stance and home gym can be shared with
                  permission. Contact details and date of birth stay out of
                  public profiles.
                </p>
                <p>
                  Anthony’s real portfolio can replace this sample after his
                  information and permissions are confirmed.
                </p>
              </div>
            )}
            <div className="product-panel">
              <h3>READY FOR YOUR NEXT CHAPTER?</h3>
              <p>
                Applications are reviewed. Buying content never affects pairing
                or participation.
              </p>
              <Link className="button red" href="/apply">
                APPLY TO SPAR <Arrow />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
