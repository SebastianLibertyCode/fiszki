import { supabaseClient } from "@/db/supabase.client";
import type { AuthError } from "@supabase/supabase-js";

export const authService = {
  async register(email: string, password: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    return { error };
  },

  getErrorMessage(error: AuthError | null): string {
    if (!error) return "";

    switch (error.message) {
      case "User already registered":
        return "An account with this email already exists. Please try logging in instead.";
      case "Password should be at least 6 characters":
        return "Password should be at least 6 characters long.";
      case "Email not confirmed":
        return "Please check your email to confirm your account.";
      default:
        return error.message || "An error occurred during registration. Please try again.";
    }
  },
};
