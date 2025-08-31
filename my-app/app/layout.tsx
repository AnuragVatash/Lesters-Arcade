import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lester's Arcade - GTA-Style Browser Minigames",
  description:
    "Play GTA/NoPixel-style hacking minigames in your browser. Casino heists, Cayo Perico breaches, and more!",
  keywords: [
    "GTA",
    "NoPixel",
    "hacking",
    "minigames",
    "browser games",
    "arcade",
  ],
  authors: [{ name: "Lester's Arcade Team" }],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Lester's Arcade",
    description: "GTA-Style Browser Minigames",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
