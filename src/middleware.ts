import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight CORS middleware for development.
// Applies to /api/* routes and will respond to preflight (OPTIONS) requests.
// IMPORTANT: This is intended for local development only. Do NOT use wide-open
// CORS policies in production. In prod, restrict origins or remove this file.

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  // Determine origin to echo. Use request Origin header if present, otherwise allow all.
  const origin = req.headers.get("origin") || "*";
  const allowCredentials = "true"; // we support credentialed requests in dev

  // Build the CORS headers we want to return for API routes
  const corsHeaders = new Headers();
  // If origin is '*', keep it; otherwise echo the incoming origin to allow credentials
  corsHeaders.set("Access-Control-Allow-Origin", origin === "null" ? "*" : origin);
  corsHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  corsHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  corsHeaders.set("Access-Control-Allow-Credentials", allowCredentials);

  // If it's a preflight request, respond immediately with 204
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // For normal requests, continue and attach headers on the response
  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", origin === "null" ? "*" : origin);
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Allow-Credentials", allowCredentials);
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
