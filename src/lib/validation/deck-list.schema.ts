import { z } from "zod";

// Schema for sorting options
const sortFieldSchema = z.enum(["created_at", "updated_at", "name"]);
const sortOrderSchema = z.enum(["asc", "desc"]);
const sortSchema = z
  .string()
  .regex(/^[a-zA-Z_]+:(asc|desc)$/)
  .transform((val) => {
    const [field, order] = val.split(":");
    return { field: field as z.infer<typeof sortFieldSchema>, order: order as z.infer<typeof sortOrderSchema> };
  })
  .optional()
  .default("created_at:desc");

// Schema for pagination parameters
export const DeckListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: sortSchema,
});

export type DeckListQuery = z.infer<typeof DeckListQuerySchema>;
