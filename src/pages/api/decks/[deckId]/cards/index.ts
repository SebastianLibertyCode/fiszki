import type { APIRoute } from "astro";
import { CardService } from "../../../../../lib/services/card.service";
import { cardQuerySchema, cardPathParamsSchema, createCardSchema } from "../../../../../lib/schemas/card.schema";

export const GET: APIRoute = async ({ params, url, locals }) => {
  try {
    // Validate path parameters
    const pathResult = cardPathParamsSchema.safeParse(params);
    if (!pathResult.success) {
      return new Response(JSON.stringify({ error: "Invalid deck ID" }), {
        status: 400,
      });
    }

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const queryResult = cardQuerySchema.safeParse(searchParams);
    if (!queryResult.success) {
      return new Response(JSON.stringify({ error: "Invalid query parameters" }), {
        status: 400,
      });
    }

    const cardService = new CardService(locals.supabase);
    const { page, limit, status } = queryResult.data;

    const result = await cardService.getCards(pathResult.data.deckId, { status }, page, limit);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // Validate path parameters
    const pathResult = cardPathParamsSchema.safeParse(params);
    if (!pathResult.success) {
      return new Response(JSON.stringify({ error: "Invalid deck ID" }), {
        status: 400,
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const bodyResult = createCardSchema.safeParse(body);
    if (!bodyResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
      });
    }

    const cardService = new CardService(locals.supabase);
    const result = await cardService.createCard(pathResult.data.deckId, bodyResult.data);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating card:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
