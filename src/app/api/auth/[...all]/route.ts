/**
 * Better-Auth API Route Handler
 * 
 * This route handles all authentication-related API requests:
 * - Login
 * - Registration
 * - Logout
 * - Session management
 * - User profile updates
 * 
 * All routes are prefixed with /api/auth/*
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(
  "handler" in auth && typeof auth.handler === "function"
    ? auth.handler
    : auth
);
