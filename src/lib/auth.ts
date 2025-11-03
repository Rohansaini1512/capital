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
  // Create a pool with sensible timeouts and a lightweight startup check so a temporary
  // network outage doesn't crash the dev server. If the connection fails on startup we
  // log a clear message and leave `database` undefined so the app can continue running
  // (set SKIP_DB=true to explicitly disable DB usage in dev).
  database: (() => {
    if (!process.env.DATABASE_URL || process.env.SKIP_DB) return undefined;

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL as string,
      // For local development allow self-signed certs; in production keep strict verification
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
      // Connection attempts will time out faster so the app can fail fast and log helpful info
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      // keepAlive helps long-lived server processes
      keepAlive: true,
    });

    // lightweight check: try to acquire and immediately release one connection
    // This logs but does not throw to avoid bringing down the dev server.
    (async () => {
      try {
        const client = await pool.connect();
        client.release();
        console.log('[DB] PostgreSQL pool connected successfully');
      } catch (err: unknown) {
        const maybeMsg = (err && typeof err === 'object' && 'message' in err)
          ? String((err as { message?: unknown }).message)
          : String(err);
        console.error('[DB] Warning: failed to connect to DATABASE_URL on startup.\n',
          'This usually means the database is unreachable from this machine (network/firewall/VPN).',
          '\nError:', maybeMsg);
        console.error('[DB] To continue local development you can:');
        console.error('  - check your internet / firewall / VPN settings');
        console.error('  - ensure the host in DATABASE_URL is reachable (nc/ping/psql tests)');
        console.error('  - run a local Postgres (docker) and point DATABASE_URL to it');
        console.error('  - or set SKIP_DB=true to disable DB usage in dev (auth DB will be unavailable)');
        // don't throw -- leave `pool` in place so subsequent retries may succeed
      }
    })();

    return pool;
  })(),
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
