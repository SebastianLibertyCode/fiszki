import { z } from "zod";

/**
 * Schema for chat messages
 */
export const MessageSchema = z.object({
  role: z.enum(["system", "user"]),
  content: z.string().min(1),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Schema for JSON response format
 */
export const ResponseFormatSchema = z
  .object({
    type: z.literal("json_schema"),
    json_schema: z.object({
      name: z.string(),
      strict: z.boolean(),
      schema: z.record(z.unknown()),
    }),
  })
  .optional();

export type ResponseFormat = z.infer<typeof ResponseFormatSchema>;

/**
 * Schema for chat completion parameters
 */
export const ModelParamsSchema = z
  .object({
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().int().positive().optional(),
    top_p: z.number().min(0).max(1).optional(),
    frequency_penalty: z.number().min(-2).max(2).optional(),
    presence_penalty: z.number().min(-2).max(2).optional(),
  })
  .catchall(z.unknown());

export type ModelParams = z.infer<typeof ModelParamsSchema>;

/**
 * Schema for chat completion options
 */
export const ChatOptionsSchema = z
  .object({
    model: z.string().optional(),
    params: ModelParamsSchema.optional(),
    responseFormat: ResponseFormatSchema,
  })
  .optional();

export type ChatOptions = z.infer<typeof ChatOptionsSchema>;

/**
 * Schema for API response
 */
export const ChatResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.literal("assistant"),
        content: z.string(),
      }),
      finish_reason: z.enum(["stop", "length", "content_filter", "null"]).nullable(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
