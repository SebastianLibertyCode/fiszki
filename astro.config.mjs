// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

const env = loadEnv(process.env.NODE_ENV, process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    define: {
      "process.env.PUBLIC_SUPABASE_URL": JSON.stringify(env.PUBLIC_SUPABASE_URL),
      "process.env.PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(env.PUBLIC_SUPABASE_ANON_KEY),
    },
  },
  adapter: node({
    mode: "standalone",
  }),
  experimental: { session: true },
});
