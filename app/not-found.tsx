import Link from "next/link";
export default function NotFound() {
  return (
    <section className="shell not-found">
      <p className="eyebrow">404 / OUTSIDE THE RING</p>
      <h1>WRONG CORNER.</h1>
      <p>This page does not exist or is not available.</p>
      <Link href="/" className="button red">
        BACK TO HOME
      </Link>
    </section>
  );
}
