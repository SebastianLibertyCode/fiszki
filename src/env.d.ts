/// <reference types="astro/client" />

import type { User } from "./types";

declare namespace App {
  interface Locals {
    user?: User;
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
