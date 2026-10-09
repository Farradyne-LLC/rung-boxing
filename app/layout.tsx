export const dynamic='force-dynamic';
import type { Metadata } from "next";
import { Barlow_Condensed, Manrope, IBM_Plex_Mono } from "next/font/google";
import SiteShell from "./components/site-shell";
import "./globals.css";
import {indexable,publicOrigin} from "./lib/seo";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});
const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export function generateMetadata():Metadata {return {
  metadataBase:new URL(publicOrigin),
  title: {
    default: "Punch Mentality — Real Rounds. Real Footage. Real Progress.",
    template: "%s | Punch Mentality",
  },
  description:
    "Organized sparring in Los Angeles and Orange County. Free approved participation during the pilot. Optional footage, highlights and a growing fighter portfolio.",
  robots: { index: indexable(), follow: indexable() },
  icons: { icon: "/brand/logo-stacked.png", apple: "/brand/logo-stacked.png" },
};}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <SiteShell preview={process.env.SITE_PREVIEW==='true'}>{children}</SiteShell>
      </body>
    </html>
  );
}
