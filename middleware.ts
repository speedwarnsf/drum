import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (!isLoggedIn && pathname.startsWith("/drum")) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("next", pathname);
    return Response.redirect(url);
  }

  return;
});

export const config = {
  matcher: ["/drum/:path*"],
};
