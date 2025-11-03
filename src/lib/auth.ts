/**
 * Better-Auth configuration for Capital Telephony AMD Application
 * 
 * Handles user authentication, session management, and user registration.
 * Uses email/password authentication with session-based auth.
 */

import { betterAuth } from "better-auth";
import { Pool } from "pg";

/**
 * Better-Auth instance configured
 * 
 * Features:
 * - Email/Password authentication
 * - Session management
 * - User registration and login
 * - Protected API routes
 */
const getAuthConfig = () => ({
  // Use Better-Auth Postgres adapter via a `pg` Pool (Kysely PostgresDialect expects a pool-like object)
  database: process.env.DATABASE_URL && !process.env.SKIP_DB
    ? new Pool({
        connectionString: process.env.DATABASE_URL as string,
        // For local development this may be false; using rejectUnauthorized false when a self-signed cert is used.
        // In production you should configure SSL/TLS properly or rely on environment configuration.
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
      })
    : undefined,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const auth = betterAuth(getAuthConfig());

/**
 * Type exports for use in client components
 */
export type Session = typeof auth.$Infer.Session;
