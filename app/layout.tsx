import type { Metadata } from "next";
import "./globals.css";
import Navigation from '../components/navigation';
import {Footer} from '../components/ui';

export const metadata: Metadata = {
  title: "Punch Mentality — Every Round Counts.",
  description:
    "A Los Angeles-first boxing development network. Coach-approved rounds, private footage and a verified fighter history. Product prototype V2.",
  robots: {index: false, follow: false},
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><a className="skip-link" href="#main">Skip to content</a><Navigation/>{children}<Footer/></body>
    </html>
  );
}
