import Link from "next/link";
export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shell">
      <article className="legal-page">
        <div className="breadcrumb">
          <Link href="/">HOME</Link>
          <span>/</span>
          <span>PREVIEW INFORMATION</span>
        </div>
        <h1>{title}</h1>
        <div className="notice">
          <strong>Draft product overview — not a final legal agreement</strong>
          <p>
            This preview explains the intended experience. Live registration
            will require reviewed policies and participation documents. No
            waiver or media release is signed here.
          </p>
        </div>
        {children}
        <p>
          <Link href="/apply">Return to the application preview →</Link>
        </p>
      </article>
    </div>
  );
}
