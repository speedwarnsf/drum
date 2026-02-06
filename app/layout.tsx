import type { Metadata, Viewport } from "next";
import { DM_Mono, Space_Grotesk } from "next/font/google";
import Image from "next/image";
import HeroVideo from "./drum/_ui/HeroVideo";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#f4ba34",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: "Dyork Drum Practice",
  description: "Daily drum practice cards with calm, teacher-style guidance.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Drum Practice",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload hero video for faster loading */}
        <link rel="preload" href="/media/YellowDrum.mp4" as="video" type="video/mp4" />
        <link rel="preload" href="/media/YellowDrum-poster.jpg" as="image" />
        {/* iOS PWA enhancements */}
        <link rel="apple-touch-icon" href="/media/repodrumlogo.gif" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Drum" />
        {/* Prevent text size adjustment on orientation change */}
        <meta name="x-ua-compatible" content="IE=edge" />
      </head>
      <body className={`${spaceGrotesk.variable} ${dmMono.variable}`}>
        <div className="hero-shell">
          <a href="/drum" aria-label="RepoDrum home">
            <Image
              className="global-logo"
              src="/media/repodrumlogo.gif"
              alt="Drum Repo"
              width={200}
              height={200}
              priority
            />
          </a>
          <section className="hero">
            <HeroVideo />
          </section>
        </div>
        {children}
      </body>
    </html>
  );
}
