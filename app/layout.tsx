import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punch Mentality — Real Rounds. Real Footage. Real Progress.",
  description:
    "Los Angeles coach-supervised sparring network and digital fighter portfolio for recreational, amateur and professional boxers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
