import Link from "next/link";
import ReviewDemo from "./review-demo";
export const metadata = { title: "Application review demo" };
export default function ReviewPage() {
  return (
    <>
      <section className="page-intro">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">HOME</Link>
            <span>/</span>
            <span>ORGANIZER DEMO</span>
          </div>
          <p className="eyebrow">PREVIEW THE PROCESS</p>
          <h1>
            PEOPLE REVIEW.
            <br />
            <span className="red-text">COACHES CONFIRM.</span>
          </h1>
          <p>
            Explore how review, attendance and content states stay separate.
            This public demonstration contains only sample scenarios and does
            not access submissions.
          </p>
        </div>
      </section>
      <section className="product-section">
        <div className="shell">
          <ReviewDemo />
        </div>
      </section>
    </>
  );
}
