import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const DEFAULT_USER_ID = "da747852-1932-42f2-9c3b-e93ed9bf3707";

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
