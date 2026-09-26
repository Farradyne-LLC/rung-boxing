import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "../../components/ui";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Next Open Ring" };
export default async function SessionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!["next", "demo"].includes(slug)) notFound();
  return (
    <>
      <section className="page-intro">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">HOME</Link>
            <span>/</span>
            <span>OPEN RING</span>
          </div>
          <p className="eyebrow">LOS ANGELES COUNTY + ORANGE COUNTY</p>
          <h1>
            NEXT SESSION.
            <br />
            <span className="red-text">COMING SOON.</span>
          </h1>
          <p>
            The next date and location are not yet confirmed. A general
            application is an expression of interest, not a booking.
          </p>
        </div>
      </section>
      <section className="product-section">
        <div className="shell product-grid">
          <div>
            <div className="event-ticket">
              <span className="mono">OPEN RING / EVENT INFORMATION</span>
              <h3>THE NEXT ROUNDS</h3>
              {[
                ["Date", "To be announced"],
                ["Gym / city", "To be confirmed"],
                ["Arrival time", "Announced with confirmation"],
                ["Session window", "To be confirmed"],
                ["Application deadline", "Not announced"],
                ["Event applications", "Not yet open"],
              ].map(([label, value]) => (
                <div className="ticket-row" key={label}>
                  <span>{label.toUpperCase()}</span>
                  <b>{value}</b>
                </div>
              ))}
              <a href="/#updates" className="button red">
                GET UPDATES <Arrow />
              </a>
            </div>
          </div>
          <div>
            <div className="product-panel">
              <h2>SHOW UP READY.</h2>
              <ul className="clean-list">
                <li>Standard participation: 18+</li>
                <li>Sufficient boxing and sparring experience</li>
                <li>Headgear, mouthguard, wraps and groin protection</li>
                <li>16 oz gloves by default; 14 oz only with coach approval</li>
                <li>On-site weigh-in, gear and coach check</li>
                <li>No scoring; either fighter or referee can stop</li>
              </ul>
              <p>
                Youth applications require a separate review and approved
                guardian procedure before confirmation.
              </p>
            </div>
            <div className="product-panel">
              <h3>THE ROUNDS ARE FREE.</h3>
              <p>
                Approved participation is free during the pilot. The optional
                $69 content offer is separate and never affects eligibility.
              </p>
              <Link className="button outline" href="/apply">
                EXPLORE THE APPLICATION <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
