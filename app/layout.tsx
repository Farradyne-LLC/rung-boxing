import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punch Mentality — Controlled Sparring. Real Footage.",
  description: "Coach-supervised sparring, professional footage, and a permanent boxing portfolio for serious recreational and amateur boxers in Los Angeles."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}