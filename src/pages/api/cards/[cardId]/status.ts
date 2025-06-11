import type { APIRoute } from "astro";
import { CardService } from "@/lib/services/card.service";
import { updateCardStatusSchema } from "@/lib/schemas/card.schema";

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const { cardId } = params;
    if (!cardId) {
      return new Response(JSON.stringify({ message: "Card ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
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
    const result = await cardService.updateCardStatus(cardId, bodyResult.data.status);

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
