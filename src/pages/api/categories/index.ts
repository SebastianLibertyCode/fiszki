import type { APIRoute } from "astro";
import { createClient } from "@/db/client";
import type { CategoryDto } from "@/types";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const supabase = createClient();

    const { data: categories, error } = await supabase.from("categories").select("id, name").order("name");

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch categories" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(categories as CategoryDto[]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
