import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const adminEmail = process.env.DRUM_ADMIN_EMAIL;
const adminPassword = process.env.DRUM_ADMIN_PASSWORD;

export const { auth, signIn, signOut, handlers } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").toString().trim().toLowerCase();
        const password = (credentials?.password ?? "").toString();

        if (!adminEmail || !adminPassword) return null;

        if (email === adminEmail.toLowerCase() && password === adminPassword) {
          return { id: "drum-admin", email };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
});
