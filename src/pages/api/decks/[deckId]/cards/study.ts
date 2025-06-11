import type { APIRoute } from "astro";
import { CardService } from "@/lib/services/card.service";

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { deckId } = params;
    if (!deckId) {
      return new Response(JSON.stringify({ message: "Deck ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = locals.supabase;
    const cardService = new CardService(supabase);

    try {
      const cards = await cardService.getStudyCards(deckId);
      return new Response(JSON.stringify(cards), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return new Response(JSON.stringify({ message: "Deck not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Failed to get study cards:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
