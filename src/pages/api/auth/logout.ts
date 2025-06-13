import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 400 }
      );
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred during logout.",
      }),
      { status: 500 }
    );
  }
};
