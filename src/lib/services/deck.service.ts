import type { SupabaseClient } from "@supabase/supabase-js";
import type { DeckListQuery } from "../validation/deck-list.schema";
import type { DeckSummaryDto, PaginatedDto, DeckDto, DeckCreateCommand, DeckUpdateCommand } from "../../types";

export class DeckService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listDecks(query: DeckListQuery, userId: string): Promise<PaginatedDto<DeckSummaryDto>> {
    const { page, limit, sort } = query;
    const offset = (page - 1) * limit;

    // Get total count
    const { count, error: countError } = await this.supabase
      .from("decks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      throw new Error(`Failed to get decks count: ${countError.message}`);
    }

    // Get paginated decks
    const { data: decks, error: decksError } = await this.supabase
      .from("decks")
      .select(
        `
        id,
        name,
        description,
        card_limit,
        created_at,
        updated_at
        `
      )
      .eq("user_id", userId)
      .order(sort.field, { ascending: sort.order === "asc" })
      .range(offset, offset + limit - 1);

    if (decksError) {
      throw new Error(`Failed to get decks: ${decksError.message}`);
    }

    return {
      data: decks as DeckSummaryDto[],
      meta: {
        page,
        total: count ?? 0,
      },
    };
  }

  async createDeck(command: DeckCreateCommand, userId: string): Promise<DeckDto> {
    const { category_ids, ...deckData } = command;

    // Validate deck name
    if (!deckData.name || deckData.name.trim() === "") {
      throw new Error("Deck name is required");
    }

    // Insert deck
    const { data: deck, error: deckError } = await this.supabase
      .from("decks")
      .insert({ ...deckData, user_id: userId })
      .select()
      .single();

    if (deckError || !deck) {
      throw new Error(`Failed to create deck: ${deckError?.message}`);
    }

    // If categories provided, create deck_categories relations
    if (category_ids && category_ids.length > 0) {
      const { error: categoriesError } = await this.supabase.from("deck_categories").insert(
        category_ids.map((categoryId) => ({
          deck_id: deck.id,
          category_id: categoryId,
        }))
      );

      if (categoriesError) {
        // If categories failed, delete the deck to maintain consistency
        await this.supabase.from("decks").delete().eq("id", deck.id);
        throw new Error(`Failed to attach categories: ${categoriesError.message}`);
      }
    }

    // Get categories for response
    const { data: categories } = await this.supabase
      .from("categories")
      .select("id, name")
      .in("id", category_ids || []);

    return {
      ...deck,
      categories: categories || [],
    };
  }

  async getDeck(deckId: string, userId: string): Promise<DeckDto> {
    // Get deck with basic fields and card count
    const { data: deck, error: deckError } = await this.supabase
      .from("decks")
      .select(
        `
        *,
        cards:cards(count)
      `
      )
      .eq("id", deckId)
      .eq("user_id", userId)
      .single();

    if (deckError || !deck) {
      throw new Error(deckError?.message || "Deck not found");
    }

    // Get categories for the deck
    const { data: categories, error: categoriesError } = await this.supabase
      .from("deck_categories")
      .select("categories(id, name)")
      .eq("deck_id", deckId);

    if (categoriesError) {
      throw new Error(`Failed to get categories: ${categoriesError.message}`);
    }

    return {
      ...deck,
      card_count: deck.cards?.[0]?.count ?? 0,
      categories: categories?.map((c) => c.categories) || [],
    };
  }

  async updateDeck(deckId: string, command: DeckUpdateCommand, userId: string): Promise<DeckDto> {
    // Check if deck exists and belongs to user
    const { data: existingDeck, error: checkError } = await this.supabase
      .from("decks")
      .select()
      .eq("id", deckId)
      .eq("user_id", userId)
      .single();

    if (checkError || !existingDeck) {
      throw new Error(checkError?.message || "Deck not found");
    }

    const { category_ids, ...deckData } = command;

    // Update deck
    const { data: deck, error: updateError } = await this.supabase
      .from("decks")
      .update(deckData)
      .eq("id", deckId)
      .select()
      .single();

    if (updateError || !deck) {
      throw new Error(`Failed to update deck: ${updateError?.message}`);
    }

    // If categories provided, update deck_categories relations
    if (category_ids !== undefined) {
      // Delete existing categories
      const { error: deleteError } = await this.supabase.from("deck_categories").delete().eq("deck_id", deckId);

      if (deleteError) {
        throw new Error(`Failed to update categories: ${deleteError.message}`);
      }

      // Insert new categories if any
      if (category_ids.length > 0) {
        const { error: insertError } = await this.supabase.from("deck_categories").insert(
          category_ids.map((categoryId) => ({
            deck_id: deckId,
            category_id: categoryId,
          }))
        );

        if (insertError) {
          throw new Error(`Failed to update categories: ${insertError.message}`);
        }
      }
    }

    // Get updated categories for response
    const { data: categories } = await this.supabase
      .from("deck_categories")
      .select("categories(id, name)")
      .eq("deck_id", deckId);

    return {
      ...deck,
      categories: categories?.map((c) => c.categories) || [],
    };
  }

  async deleteDeck(deckId: string, userId: string): Promise<void> {
    // Check if deck exists and belongs to user
    const { data: deck, error: deckError } = await this.supabase
      .from("decks")
      .select("id")
      .eq("id", deckId)
      .eq("user_id", userId)
      .single();

    if (deckError || !deck) {
      throw new Error(deckError?.message || "Deck not found");
    }

    // Delete deck (cascade will handle related records)
    const { error: deleteError } = await this.supabase.from("decks").delete().eq("id", deckId);

    if (deleteError) {
      throw new Error(`Failed to delete deck: ${deleteError.message}`);
    }
  }
}
