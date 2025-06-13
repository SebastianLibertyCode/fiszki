import type { APIRoute } from "astro";
import { DeckService } from "@/lib/services/deck.service";
import type { DeckUpdateCommand } from "@/types";
import { z } from "zod";

const deckUpdateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  card_limit: z.number().int().min(1).max(1000).optional(),
  category_ids: z.array(z.string()).optional(),
});

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
    const deckService = new DeckService(supabase);

    try {
      const deck = await deckService.getDeck(deckId, locals.user.id);
      return new Response(JSON.stringify(deck), {
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
    console.error("Failed to get deck:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const { deckId } = params;
    if (!deckId) {
      return new Response(JSON.stringify({ message: "Deck ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const validationResult = deckUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid deck data", details: validationResult.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = locals.supabase;
    const deckService = new DeckService(supabase);
    const updateCommand: DeckUpdateCommand = validationResult.data;

    try {
      const updatedDeck = await deckService.updateDeck(deckId, locals.user.id, updateCommand);
      return new Response(JSON.stringify(updatedDeck), {
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
    console.error("Failed to update deck:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { deckId } = params;
    if (!deckId) {
      return new Response(JSON.stringify({ message: "Deck ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = locals.supabase;
    const deckService = new DeckService(supabase);

    try {
      await deckService.deleteDeck(deckId, locals.user.id);
      return new Response(null, { status: 204 });
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
    console.error("Failed to delete deck:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
