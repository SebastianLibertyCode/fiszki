import type { APIRoute } from "astro";
import { createClient } from "@/db/client";
import type { DeckSummaryDto, PaginatedDto } from "@/types";
import { z } from "zod";
import { deckCreateSchema } from "@/lib/validation/deck-create.schema";

export const prerender = false;

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  categories: z
    .string()
    .optional()
    .transform((val) => val?.split(",") ?? []),
});

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const searchParams = Object.fromEntries(url.searchParams);
    const { page, limit, categories } = querySchema.parse(searchParams);
    const offset = (page - 1) * limit;

    const supabase = createClient();
    let query = supabase
      .from("decks")
      .select("id, name, description, card_limit, created_at, updated_at", { count: "exact" })
      .eq("user_id", locals.user.id);

    if (categories.length > 0) {
      const deckIds = await supabase
        .from("deck_categories")
        .select("deck_id")
        .in("category_id", categories)
        .then(({ data }) => data?.map((row) => row.deck_id) ?? []);

      query = query.in("id", deckIds);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch decks" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response: PaginatedDto<DeckSummaryDto> = {
      data: data as DeckSummaryDto[],
      meta: {
        page,
        total: count ?? 0,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching decks:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const validationResult = deckCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid deck data", details: validationResult.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const deck = validationResult.data;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("decks")
      .insert({
        name: deck.name,
        description: deck.description,
        card_limit: deck.card_limit,
        user_id: locals.user.id,
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to create deck" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (deck.category_ids?.length) {
      const { error: categoryError } = await supabase.from("deck_categories").insert(
        deck.category_ids.map((categoryId) => ({
          deck_id: data.id,
          category_id: categoryId,
        }))
      );

      if (categoryError) {
        console.error("Failed to attach categories:", categoryError);
      }
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating deck:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
