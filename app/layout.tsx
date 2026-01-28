import type { Metadata } from "next";
import { DM_Mono, Space_Grotesk } from "next/font/google";
import Image from "next/image";
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

export const metadata: Metadata = {
  title: "Dyork Drum Practice",
  description: "Daily drum practice cards with calm, teacher-style guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${dmMono.variable}`}>
        <Image
          className="global-logo"
          src="/media/repodrumlogo.gif"
          alt="Drum Repo"
          width={180}
          height={180}
          priority
        />
        {children}
      </body>
    </html>
  );
}
