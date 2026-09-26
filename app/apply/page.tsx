import type { Metadata } from "next";
import Link from "next/link";
import ApplicationForm from "./application-form";
export const metadata: Metadata = { title: "Apply to spar" };
export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ content?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <section className="page-intro">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">HOME</Link>
            <span>/</span>
            <span>FIGHTER APPLICATION</span>
          </div>
          <p className="eyebrow">THE FIRST STEP TO YOUR NEXT ROUNDS</p>
          <h1>
            SHOW US
            <br />
            <span className="red-text">WHERE YOU’RE AT.</span>
          </h1>
          <p>
            A little about you. A lot about your boxing. Every application and
            pairing gets a human review.
          </p>
        </div>
      </section>
      <section className="product-section">
        <div className="shell application-layout">
          <aside className="application-aside">
            <h2>
              REAL ROUNDS.
              <br />
              THE RIGHT PAIRING.
            </h2>
            <p>
              Los Angeles County + Orange County. General interest for future
              sessions; a date and place are not yet confirmed.
            </p>
            <div className="price-summary">
              <div>
                <span>Approved sparring</span>
                <b>FREE</b>
              </div>
              <div>
                <span>Optional content</span>
                <b>$69</b>
              </div>
            </div>
            <p>Content interest never affects your eligibility.</p>
            <ol className="status-trail">
              <li>
                <strong>Application review</strong>
                <p>Experience, weight and availability.</p>
              </li>
              <li>
                <strong>Coach approval</strong>
                <p>An appropriate partner comes first.</p>
              </li>
              <li>
                <strong>Session confirmation</strong>
                <p>Only after an explicit confirmation.</p>
              </li>
            </ol>
            <p className="fine">
              Preview only. Use sample details. This form does not send or save
              personal information.
            </p>
          </aside>
          <ApplicationForm interested={params.content === "yes"} />
        </div>
      </section>
    </>
  );
}
