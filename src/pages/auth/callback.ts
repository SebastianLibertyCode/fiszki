import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const GET: APIRoute = async ({ url, cookies, request, redirect }) => {
  const code = url.searchParams.get("code");

  // If no code is present, redirect to login
  if (!code) {
    return redirect("/login");
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  // If there's an error, redirect to login
  if (error) {
    console.error("Auth callback error:", error);
    return redirect("/login");
  }

  // Successful auth, redirect to decks
  return redirect("/decks");
};
