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
  title: "RepoDrum — Practice Pad Rudiment Trainer",
  description: "All 40 PAS Essential Rudiments with notation, metronome, and spaced repetition.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://repodrum.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "RepoDrum",
    locale: "en_US",
    title: "RepoDrum — Practice Pad Rudiment Trainer",
    description: "All 40 PAS Essential Rudiments with notation, metronome, and spaced repetition. Track progress, build muscle memory, and master your drumming fundamentals.",
    url: "https://repodrum.com/",
    images: [
      {
        url: "https://repodrum.com/media/repodrumlogo.gif",
        width: 200,
        height: 200,
        alt: "RepoDrum logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@repodrum",
    creator: "@repodrum",
    title: "RepoDrum — Practice Pad Rudiment Trainer",
    description: "All 40 PAS Essential Rudiments with notation, metronome, and spaced repetition. Track progress, build muscle memory, and master your drumming fundamentals.",
    images: [
      {
        url: "https://repodrum.com/media/repodrumlogo.gif",
        alt: "RepoDrum logo",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RepoDrum",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "RepoDrum",
              "alternateName": "RepoDrum Practice Pad Trainer",
              "url": "https://repodrum.com",
              "description": "All 40 PAS Essential Rudiments with notation, metronome, and spaced repetition. Track progress, build muscle memory, and master your drumming fundamentals.",
              "applicationCategory": "EducationalApplication",
              "applicationSubCategory": "Music Education",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "browserRequirements": "Requires JavaScript",
              "image": "https://repodrum.com/media/repodrumlogo.gif",
              "screenshot": "https://repodrum.com/media/repodrumlogo.gif",
              "featureList": "40 PAS Essential Rudiments, Built-in Metronome, Spaced Repetition, Progress Tracking, Practice Journal, Skill Assessment",
              "softwareVersion": "1.0",
              "creator": {
                "@type": "Organization",
                "name": "RepoDrum",
                "url": "https://repodrum.com"
              },
              "inLanguage": "en",
              "isAccessibleForFree": true
            })
          }}
        />
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
        <a href="#main-content" className="skip-link">Skip to content</a>
        <div className="hero-shell">
          <a href="/drum" aria-label="RepoDrum home">
            <Image
              className="global-logo"
              src="/media/repodrumlogo.gif"
              alt="RepoDrum — Practice Pad Rudiment Trainer"
              width={200}
              height={200}
              priority
            />
          </a>
          <section className="hero">
            <HeroVideo />
          </section>
        </div>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
