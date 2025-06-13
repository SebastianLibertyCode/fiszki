import { sequence } from "astro:middleware";
import { authMiddleware } from "./auth";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/auth/callback", // Required for Supabase auth redirects
  "/auth/reset-password",
];

const protectedPaths = ["/decks", "/api/decks"];

export const onRequest = sequence(authMiddleware);
