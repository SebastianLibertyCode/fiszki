import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { StudyCardDto, CardDto, CardCreateCommand, CardUpdateCommand, PaginatedDto } from "@/types";

export class CardService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getCards(
    deckId: string,
    filters: { status?: Database["public"]["Enums"]["card_status"] } = {},
    page = 1,
    limit = 50
  ): Promise<PaginatedDto<CardDto>> {
    const offset = (page - 1) * limit;

    // Start building the query
    let query = this.supabase
      .from("cards")
      .select("*", { count: "exact" })
      .eq("deck_id", deckId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch cards: ${error.message}`);
    }

    return {
      data: data as CardDto[],
      meta: {
        page,
        total: count ?? 0,
      },
    };
  }

  async createCard(deckId: string, command: CardCreateCommand): Promise<CardDto> {
    const { data, error } = await this.supabase
      .from("cards")
      .insert({
        deck_id: deckId,
        question: command.question,
        answer: command.answer,
        status: "pending",
        job_id: "00000000-0000-0000-0000-000000000000", // Manual creation placeholder
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create card: ${error.message}`);
    }

    return data as CardDto;
  }

  async updateCard(deckId: string, cardId: string, command: CardUpdateCommand): Promise<CardDto> {
    const { data, error } = await this.supabase
      .from("cards")
      .update({
        question: command.question,
        answer: command.answer,
      })
      .eq("deck_id", deckId)
      .eq("id", cardId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update card: ${error.message}`);
    }

    return data as CardDto;
  }

  async deleteCard(deckId: string, cardId: string): Promise<void> {
    const { error } = await this.supabase.from("cards").delete().eq("deck_id", deckId).eq("id", cardId);

    if (error) {
      throw new Error(`Failed to delete card: ${error.message}`);
    }
  }

  async updateCardStatus(cardId: string, status: Database["public"]["Enums"]["card_status"]): Promise<CardDto> {
    const now = new Date().toISOString();
    const updates = {
      status,
      review_started_at: now,
      review_finished_at: now,
    };

    const { data, error } = await this.supabase.from("cards").update(updates).eq("id", cardId).select().single();

    if (error) {
      throw new Error(`Failed to update card status: ${error.message}`);
    }

    return data as CardDto;
  }

  async getStudyCards(deckId: string): Promise<StudyCardDto[]> {
    const { data, error } = await this.supabase
      .from("cards")
      .select("id, question, answer, status, review_started_at, review_finished_at, time_spent")
      .eq("deck_id", deckId)
      .order("review_started_at", { ascending: true, nullsFirst: true });

    if (error) {
      throw new Error(`Failed to fetch study cards: ${error.message}`);
    }

    return data.map((card) => ({
      id: card.id,
      front: card.question,
      back: card.answer,
      status: card.status,
      lastReviewedAt: card.review_started_at,
      nextReviewAt: card.review_finished_at,
      reviewCount: 0, // This will be calculated based on time_spent in a future update
    }));
  }
}
