import { z } from "zod";

const cardStatusValues = ["pending", "accepted", "rejected"] as const;

// Base schema for card content validation
const cardContentSchema = {
  question: z.string().max(200, "Question must be at most 200 characters"),
  answer: z.string().max(500, "Answer must be at most 500 characters"),
};

// Schema for creating a new card
export const createCardSchema = z.object(cardContentSchema);

// Schema for updating an existing card
export const updateCardSchema = z.object(cardContentSchema);

// Schema for updating card status
export const updateCardStatusSchema = z.object({
  status: z.enum(["new", "in_progress", "accepted", "rejected"]),
});

// Schema for query parameters
export const cardQuerySchema = z.object({
  status: z.enum(cardStatusValues).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(50),
});

// Schema for path parameters
export const cardPathParamsSchema = z.object({
  deckId: z.string().uuid(),
  cardId: z.string().uuid().optional(),
});
