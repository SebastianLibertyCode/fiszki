import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createClient() {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Environment variables state:", {
      url: supabaseUrl ? "defined" : "undefined",
      key: supabaseKey ? "defined" : "undefined",
      env: import.meta.env,
    });
    throw new Error("Missing Supabase environment variables");
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseKey);
}
