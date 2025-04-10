import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  console.log("Middleware path:", url.pathname);

  // If the user is not logged in and tries to access protected routes
  if (!token) {
    // Protect all authenticated routes
    if (
      url.pathname.startsWith("/profile") ||
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/admin")
    ) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
  } else {
    // User is logged in

    // Redirect authenticated users away from auth pages
    if (
      url.pathname.startsWith("/auth/sign-in") ||
      url.pathname.startsWith("/auth/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Role-based access control
    const userRole = token.role as string;

    // Protect admin routes - only allow users with admin role
    if (url.pathname.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Optional: Protect rider routes
    if (url.pathname.startsWith("/rider") && userRole !== "rider") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Otherwise allow the request
  return NextResponse.next();
}

// Update the config to include new protected paths
export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/verify/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    "/admin/:path*", // Protect admin routes
    "/rider/:path*", // Optional: Protect rider routes
  ],
};

// Export default next-auth middleware
export { default } from "next-auth/middleware";
