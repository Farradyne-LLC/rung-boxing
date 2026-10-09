import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {ProfileCard} from "../../components/ui";
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
            A fictional Iron Mike sample portfolio. The illustrated sessions,
            age and statistics are not a real Punch participation record.
          </p>
        </div>
      </section>
      <section className="product-section">
        <div className="shell">
          <div className="sample-profile-page"><ProfileCard /></div>
        </div>
      </section>
    </>
  );
}
