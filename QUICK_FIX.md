# Quick Fix for Hanging Server

The server is hanging at "✓ Starting..." which typically means Better-Auth is trying to connect to the database during compilation.

## Solution 1: Use Memory Adapter Temporarily

Edit `src/lib/auth.ts` and comment out the database config temporarily:

```typescript
export const auth = betterAuth({
  // Temporarily disable database to test
  // database: process.env.DATABASE_URL ? {
  //   provider: "postgresql" as const,
  //   url: process.env.DATABASE_URL,
  // } : undefined,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});
```

This will use Better-Auth's in-memory adapter and should let the server start.

## Solution 2: Check Database Connection

The database might be slow to connect. Try:
```bash
# Test database connection speed
time npx prisma db push --skip-generate
```

If this hangs, the database connection is the issue.

## Solution 3: Initialize Better-Auth Tables

Better-Auth might need tables created first. Check the Better-Auth docs for initialization commands.



