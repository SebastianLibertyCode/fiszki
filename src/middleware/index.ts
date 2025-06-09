import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient;
  return next();
});
