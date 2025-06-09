import type { APIRoute } from "astro";
import { CardService } from "../../../../../lib/services/card.service";
import { cardPathParamsSchema, updateCardSchema, updateCardStatusSchema } from "../../../../../lib/schemas/card.schema";

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // Validate path parameters
    const pathResult = cardPathParamsSchema.safeParse(params);
    if (!pathResult.success || !pathResult.data.cardId) {
      return new Response(JSON.stringify({ error: "Invalid deck ID or card ID" }), {
        status: 400,
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const bodyResult = updateCardSchema.safeParse(body);
    if (!bodyResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
      });
    }

    const cardService = new CardService(locals.supabase);
    const result = await cardService.updateCard(pathResult.data.deckId, pathResult.data.cardId, bodyResult.data);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating card:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Validate path parameters
    const pathResult = cardPathParamsSchema.safeParse(params);
    if (!pathResult.success || !pathResult.data.cardId) {
      return new Response(JSON.stringify({ error: "Invalid deck ID or card ID" }), {
        status: 400,
      });
    }

    const cardService = new CardService(locals.supabase);
    await cardService.deleteCard(pathResult.data.deckId, pathResult.data.cardId);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    // Validate path parameters
    const pathResult = cardPathParamsSchema.safeParse(params);
    if (!pathResult.success || !pathResult.data.cardId) {
      return new Response(JSON.stringify({ error: "Invalid deck ID or card ID" }), {
        status: 400,
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const bodyResult = updateCardStatusSchema.safeParse(body);
    if (!bodyResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
      });
    }

    const cardService = new CardService(locals.supabase);
    const result = await cardService.updateCardStatus(pathResult.data.deckId, pathResult.data.cardId, bodyResult.data);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating card status:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
