import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ProfilePreview from "./profile-preview";
export const metadata: Metadata = { title: "Sample fighter portfolio" };
export default async function FighterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== "demo") notFound();
  return (
    <>
      <section className="page-intro">
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/">HOME</Link>
            <span>/</span>
            <span>SAMPLE FIGHTER PORTFOLIO</span>
          </div>
          <p className="eyebrow">YOUR BOXING HISTORY STARTS HERE</p>
          <h1>
            A BODY
            <br />
            <span className="red-text">OF WORK.</span>
          </h1>
          <p>
            A sample portfolio, ready for real sessions. No real fighter data,
            achievements or footage are represented here.
          </p>
        </div>
      </section>
      <section className="product-section">
        <div className="shell">
          <ProfilePreview />
        </div>
      </section>
    </>
  );
}
