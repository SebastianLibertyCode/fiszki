import type { MiddlewareHandler } from "astro";
import type { AstroCookies, APIContext } from "astro";
import { createClient } from "@/db/client";

// Paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/register", "/reset-password", "/update-password", "/api/auth", "/_astro", "/assets"];

export const authMiddleware: MiddlewareHandler = async (
  {
    cookies,
    locals,
    request,
  }: {
    cookies: AstroCookies;
    locals: APIContext["locals"];
    request: Request;
  },
  next: () => Promise<Response>
) => {
  const url = new URL(request.url);

  // Skip auth for public paths
  if (PUBLIC_PATHS.some((path) => url.pathname.startsWith(path))) {
    return next();
  }

  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    if (request.headers.get("accept")?.includes("application/json")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return Response.redirect(new URL("/login", request.url));
  }

  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });

    if (request.headers.get("accept")?.includes("application/json")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return Response.redirect(new URL("/login", request.url));
  }

  if (!user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  locals.user = {
    id: user.id,
    email: user.email,
  };
  locals.accessToken = accessToken;
  locals.supabase = supabase;

  return next();
};
