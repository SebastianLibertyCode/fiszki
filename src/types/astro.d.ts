import type { User, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/types";

declare namespace App {
  interface Locals {
    user: User;
    accessToken: string;
    supabase: SupabaseClient<Database>;
  }
}
