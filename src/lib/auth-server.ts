/**
 * Server-side auth utilities
 * 
 * Helper functions for server components to access auth session
 */

import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Get the current user session on the server
 * 
 * @returns Session object if authenticated, null otherwise
 */
export async function getServerSession() {
  try {
    // Better-Auth v1.x uses request-based session handling
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    
    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: cookieHeader,
      }),
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Get the current user on the server
 * 
 * @returns User object if authenticated, null otherwise
 */
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}
