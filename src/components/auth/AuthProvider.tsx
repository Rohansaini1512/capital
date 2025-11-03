/**
 * AuthProvider Component
 * 
 * Wraps the application with Better-Auth context to provide
 * authentication state and methods to child components.
 */

"use client";

import { createAuthClient } from "better-auth/react";
import { ReactNode } from "react";

/**
 * Better-Auth client instance for React hooks
 */
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

/**
 * AuthProvider wrapper component
 * 
 * Better-Auth v1.x doesn't require a Provider wrapper.
 * The client is used directly via hooks.
 * 
 * @param children - Child components that need auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Export auth client for use in components
 */
export { authClient };
