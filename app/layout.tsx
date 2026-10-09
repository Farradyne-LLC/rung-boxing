export const dynamic='force-dynamic';
import type { Metadata } from "next";
import { Barlow_Condensed, Manrope, IBM_Plex_Mono } from "next/font/google";
import SiteShell from "./components/site-shell";
import "./globals.css";

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

export const metadata: Metadata = {
  title: {
    default: "Punch Mentality — Real Rounds. Real Footage. Real Progress.",
    template: "%s | Punch Mentality",
  },
  description:
    "Organized sparring in Los Angeles and Orange County. Free approved participation during the pilot. Optional footage, highlights and a growing fighter portfolio.",
  robots: { index: false, follow: false },
  icons: { icon: "/brand/logo-stacked.png", apple: "/brand/logo-stacked.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <SiteShell live={process.env.APPLICATIONS_OPEN==='true'}>{children}</SiteShell>
      </body>
    </html>
  );
}
