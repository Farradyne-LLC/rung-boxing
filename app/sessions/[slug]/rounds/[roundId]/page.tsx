import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "../../../../components/ui";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Completed session example" };
export default async function RoundPage({
  params,
}: {
  params: Promise<{ slug: string; roundId: string }>;
}) {
  const { slug, roundId } = await params;
  if (slug !== "demo" || roundId !== "sample") notFound();
  return (
    <>
      <section className="page-intro">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/fighters/demo">SAMPLE PORTFOLIO</Link>
            <span>/</span>
            <span>SESSION LAYOUT</span>
          </div>
          <p className="eyebrow">DEMONSTRATION · NO REAL SESSION RECORD</p>
          <h1>
            SESSION
            <br />
            <span className="red-text">COMPLETE.</span>
          </h1>
          <p>
            This is an example of the completed-session screen. No actual
            participation, check-in or footage is claimed.
          </p>
        </div>
      </section>
      <section className="product-section">
        <div className="shell">
          <div className="notice">
            <strong>A session is one pair’s rounds.</strong>An Open Ring event
            can contain multiple sessions. Participation, content delivery and
            publication each have their own status.
          </div>
          <div className="product-grid">
            <div className="product-panel">
              <h2>FIGHTER A × FIGHTER B</h2>
              {[
                ["Event", "Sample layout only"],
                ["Date / gym", "Not assigned"],
                ["Rounds / duration", "Not recorded"],
                ["Coach", "Not assigned"],
                ["Participation", "Completed — example state"],
                ["Content", "Awaiting delivery — example state"],
              ].map(([label, value]) => (
                <div className="ticket-row" key={label}>
                  <span>{label}</span>
                  <b>{value}</b>
                </div>
              ))}
              <div className="actions">
                <Link href="/fighters/demo" className="button outline">
                  VIEW SAMPLE PROFILE <Arrow />
                </Link>
                <Link href="/apply" className="button red">
                  APPLY FOR NEXT SESSION <Arrow />
                </Link>
              </div>
            </div>
            <div>
              <div className="product-panel">
                <h2>YOUR FOOTAGE</h2>
                <p>
                  No video is attached to this sample. Watch actions become
                  available only when footage is delivered and access is
                  permitted.
                </p>
                <button className="button outline" disabled>
                  FOOTAGE NOT AVAILABLE
                </button>
              </div>
              <div className="product-panel">
                <h2>YOUR HIGHLIGHT</h2>
                <p>
                  A personal edit is part of the optional content package.
                  Public sharing requires the relevant permissions from both
                  fighters.
                </p>
                <button className="button outline" disabled>
                  HIGHLIGHT NOT AVAILABLE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
