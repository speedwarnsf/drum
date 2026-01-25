import { withAuth } from "next-auth/middleware";

export default withAuth(
  () => undefined,
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/drum/:path*"],
};
