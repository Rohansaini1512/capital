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

  // Build the CORS headers we want to return for API routes
  const corsHeaders = new Headers();
  corsHeaders.set("Access-Control-Allow-Origin", "*");
  corsHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  corsHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // If it's a preflight request, respond immediately with 204
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // For normal requests, continue and attach headers on the response
  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
