import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const adminEmail = (process.env.DRUM_ADMIN_EMAIL || "").trim().toLowerCase();
const adminPassword = process.env.DRUM_ADMIN_PASSWORD || "";
const fallbackUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

if (!process.env.NEXTAUTH_URL && fallbackUrl) {
  process.env.NEXTAUTH_URL = fallbackUrl;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");

        if (!adminEmail || !adminPassword) return null;
        if (email === adminEmail && password === adminPassword) {
          return { id: "drum-admin", email };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: "/login" },
};
