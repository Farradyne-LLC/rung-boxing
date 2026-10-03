"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Arrow } from "./ui";
export default function SiteShell({ children, live=false }: { children: React.ReactNode;live?:boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {!live&&<div className="preview-bar">
        <span>V3 PREVIEW</span> Explore the experience. Applications, payments
        and publishing are not live.
        <Link href="/preview/review">
          Review demo <span aria-hidden="true">↗</span>
        </Link>
      </div>}
      <header className="site-header">
        <div className="shell nav">
          <Link
            href="/"
            className="brand"
            aria-label="Punch Mentality home"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/brand/logo-horizontal.png"
              alt="Punch Mentality"
              width={300}
              height={120}
              priority
            />
          </Link>
          <nav
            aria-label="Main navigation"
            className={open ? "nav-links open" : "nav-links"}
          >
            {[
              ["THE EXPERIENCE", "/#experience"],
              ["HOW IT WORKS", "/#how"],
              ["THE GYM", "/gym"],
              ["THE CONTENT", "/#footage"],
            ].map(([text, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {text}
              </Link>
            ))}
          </nav>
          <Link
            href="/apply"
            className="button red nav-apply"
            aria-current={pathname === "/apply" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            APPLY TO SPAR <Arrow />
          </Link>
          <button
            className="menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="shell">
          <div className="footer-top">
            <Link href="/" className="brand" aria-label="Punch Mentality home">
              <Image
                src="/brand/logo-horizontal.png"
                alt="Punch Mentality"
                width={300}
                height={120}
              />
            </Link>
            <p>
              MODERN SPARRING CULTURE.
              <br />
              LOS ANGELES + ORANGE COUNTY.
            </p>
            <Link href="/#updates" className="text-link">
              GET UPDATES <Arrow />
            </Link>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} PUNCH MENTALITY</span>
            <div>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms of Participation & Content</Link>
            </div>
            <span>NO SCORECARDS. JUST WORK.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
