import { withAuth } from "next-auth/middleware";

const CANONICAL_HOST = "drum-speed-warns-projects.vercel.app";

export default withAuth(
  function middleware(req) {
    const host = req.headers.get("host") || "";
    if (host && host !== CANONICAL_HOST) {
      const url = req.nextUrl.clone();
      url.host = CANONICAL_HOST;
      url.protocol = "https:";
      return Response.redirect(url, 308);
    }
  },
  {
    pages: { signIn: "/login" },
    callbacks: { authorized: ({ token }) => !!token },
  }
);

export const config = {
  matcher: ["/drum/:path*", "/login", "/api/auth/:path*"],
};
