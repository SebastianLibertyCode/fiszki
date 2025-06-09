import type { Tables, Enums } from "./db/database.types";

// Metadata for pagination responses
export interface PaginationMetaDto {
  page: number;
  total: number;
}

// Generic structure for paginated lists
export interface PaginatedDto<T> {
  data: T[];
  meta: PaginationMetaDto;
}

// Category DTO representing minimal public fields
export type CategoryDto = Pick<Tables<"categories">, "id" | "name">;

// Deck DTOs and commands
// Summary of deck fields for list endpoints
export type DeckSummaryDto = Pick<
  Tables<"decks">,
  "id" | "name" | "description" | "card_limit" | "created_at" | "updated_at"
>;

// Full deck DTO including associated categories
export interface DeckDto extends DeckSummaryDto {
  categories: CategoryDto[];
}

// Command to create a new deck
export type DeckCreateCommand = Pick<Tables<"decks">, "name" | "description" | "card_limit"> & {
  category_ids?: string[];
};

// Command to update an existing deck (same shape as create)
export type DeckUpdateCommand = DeckCreateCommand;

// Command to attach categories to a deck
export interface DeckAttachCategoriesCommand {
  category_ids: string[];
}

// Card DTOs and commands
export type CardDto = Pick<
  Tables<"cards">,
  | "id"
  | "deck_id"
  | "question"
  | "answer"
  | "status"
  | "source_fragment"
  | "review_started_at"
  | "review_finished_at"
  | "created_at"
  | "updated_at"
>;

// Command to manually create a card
export type CardCreateCommand = Pick<Tables<"cards">, "question" | "answer">;

// Command to update a card's content (Q/A)
export type CardUpdateCommand = CardCreateCommand;

// Command to change a card's review status
export interface CardStatusUpdateCommand {
  status: Enums<"card_status">;
}

// AI Job DTOs and commands
// Command to enqueue an AI generation job
export type AiJobCreateCommand = Pick<Tables<"ai_jobs">, "input_text" | "requested_card_count">;

// Response when AI job is created
export interface AiJobCreateResponseDto {
  job_id: Tables<"ai_jobs">["id"];
  status: Enums<"ai_job_status">;
}

// Summary DTO for listing AI jobs
export type AiJobDto = Pick<
  Tables<"ai_jobs">,
  | "id"
  | "status"
  | "requested_card_count"
  | "actual_card_count"
  | "tokens_used"
  | "created_at"
  | "started_at"
  | "finished_at"
>;

// Detailed AI job DTO including generated cards
export interface AiJobDetailDto extends AiJobDto {
  cards: CardDto[];
}

// Response when retrying a failed or timed-out job
export interface AiJobRetryResponseDto {
  job_id: Tables<"ai_jobs">["id"];
  status: Enums<"ai_job_status">;
}

// DTO for AI job performance metrics
export type AiJobMetricsDto = Pick<Tables<"ai_metrics">, "latency_ms" | "outcome">;

// DTO for daily token usage
export type TokenUsageDto = Pick<Tables<"token_usage">, "tokens_used" | "usage_date">;
