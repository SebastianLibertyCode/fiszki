import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: mapSupabaseError(error.message),
        }),
        { status: 400 }
      );
    }

    // Set auth cookies
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      const { access_token, refresh_token } = sessionData.session;

      cookies.set("sb-access-token", access_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      cookies.set("sb-refresh-token", refresh_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again later.",
      }),
      { status: 500 }
    );
  }
};

// Helper function to map Supabase error messages to user-friendly messages
function mapSupabaseError(error: string): string {
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Invalid email or password",
    "Email not confirmed": "Please verify your email address",
    "Invalid email or password": "Invalid email or password",
    "Too many requests": "Too many login attempts. Please try again later",
  };

  return errorMap[error] || "An unexpected error occurred. Please try again later";
}
