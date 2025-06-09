import { z } from "zod";

export const deckCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  card_limit: z.number().int().positive().optional(),
  category_ids: z.array(z.string().uuid()).optional(),
});

export type DeckCreateCommandType = z.infer<typeof deckCreateSchema>;
