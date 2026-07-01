import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const engrave = Fraunces({
  subsets: ["latin"],
  variable: "--font-engrave",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const mark = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mark",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Strata",
  description: "Memory, settled into stone.",
};

export const viewport: Viewport = {
  themeColor: "#0B0A08",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${engrave.variable} ${mark.variable}`}>
      <body className="core-grain">{children}</body>
    </html>
  );
}
