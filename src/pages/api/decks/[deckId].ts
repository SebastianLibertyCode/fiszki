import type { APIRoute } from "astro";
import { DeckService } from "@/lib/services/deck.service";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
import type { DeckUpdateCommand } from "@/types";

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
      const deck = await deckService.getDeck(deckId, DEFAULT_USER_ID);
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
    const deckId = params.deckId;
    if (!deckId) {
      return new Response("Deck ID is required", { status: 400 });
    }

    const supabase = locals.supabase;
    const deckService = new DeckService(supabase);
    const updateCommand = (await request.json()) as DeckUpdateCommand;
    const updatedDeck = await deckService.updateDeck(deckId, updateCommand, DEFAULT_USER_ID);

    return new Response(JSON.stringify(updatedDeck), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating deck:", error);
    return new Response(JSON.stringify({ message: "Failed to update deck" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const deckId = params.deckId;
    if (!deckId) {
      return new Response("Deck ID is required", { status: 400 });
    }

    const supabase = locals.supabase;
    const deckService = new DeckService(supabase);
    await deckService.deleteDeck(deckId, DEFAULT_USER_ID);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting deck:", error);
    return new Response(JSON.stringify({ message: "Failed to delete deck" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
