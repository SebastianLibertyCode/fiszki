import type { APIRoute } from "astro";
import { z } from "zod";
import { OpenRouterService } from "@/lib/services/OpenRouterService";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
import type { AiJobCreateResponseDto } from "@/types";
import type { Database } from "@/db/database.types";
import { validateEnv } from "@/lib/validation/env.schema";

interface Flashcard {
  question: string;
  answer: string;
}

export const prerender = false;

const aiJobParamsSchema = z.object({
  deckId: z.string().uuid(),
});

const aiJobCreateSchema = z.object({
  input_text: z.string().min(1).max(10000),
  requested_card_count: z.number().int().positive(),
});

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // Validate environment variables
    const env = validateEnv();

    // Validate path parameters
    const pathResult = aiJobParamsSchema.safeParse(params);
    if (!pathResult.success) {
      return new Response(JSON.stringify({ error: "Invalid deck ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const bodyResult = aiJobCreateSchema.safeParse(body);
    if (!bodyResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: bodyResult.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create AI job record
    const { data: job, error: jobError } = await locals.supabase
      .from("ai_jobs")
      .insert({
        deck_id: pathResult.data.deckId,
        user_id: DEFAULT_USER_ID,
        input_text: bodyResult.data.input_text,
        requested_card_count: bodyResult.data.requested_card_count,
        status: "pending",
      })
      .select()
      .single();

    if (jobError) {
      console.error("Failed to create AI job:", jobError);
      return new Response(JSON.stringify({ error: "Failed to create AI job" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize OpenRouter service
    const openRouter = new OpenRouterService({
      apiKey: env.OPENROUTER_API_KEY,
      defaultModel: "deepseek/deepseek-r1-0528:free",
    });

    // Prepare system prompt
    const systemPrompt = `Jesteś pomocnym asystentem, który tworzy fiszki z dostarczonego tekstu.
Każda fiszka powinna mieć formę pytania i odpowiedzi.
Pytanie powinno sprawdzać zrozumienie konkretnego pojęcia z tekstu.
Odpowiedź powinna być zwięzła, ale pełna.
Wygeneruj dokładnie ${bodyResult.data.requested_card_count} fiszek.
Sformatuj swoją odpowiedź jako tablicę JSON z obiektami zawierającymi pola "question" i "answer".`;

    // Send request to OpenRouter
    try {
      const response = await openRouter.sendChat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: bodyResult.data.input_text },
        ],
        {
          responseFormat: {
            type: "json_schema",
            json_schema: {
              name: "FlashcardsSchema",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  flashcards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" },
                      },
                      required: ["question", "answer"],
                    },
                    minItems: bodyResult.data.requested_card_count,
                    maxItems: bodyResult.data.requested_card_count,
                  },
                },
                required: ["flashcards"],
              },
            },
          },
        }
      );

      // Validate response structure
      if (!response?.choices?.[0]?.message?.content) {
        throw new Error("Invalid response structure from OpenRouter API");
      }

      let parsedContent;
      try {
        // If content is a string, parse it
        if (typeof response.choices[0].message.content === "string") {
          parsedContent = JSON.parse(response.choices[0].message.content);
        } else {
          parsedContent = response.choices[0].message.content;
        }

        if (!parsedContent?.flashcards || !Array.isArray(parsedContent.flashcards)) {
          throw new Error("Response does not contain flashcards array");
        }

        const flashcards = parsedContent.flashcards as Flashcard[];

        // Create cards from response
        const cards = flashcards;

        // Insert cards
        const { error: cardsError } = await locals.supabase.from("cards").insert(
          cards.map((card) => ({
            deck_id: pathResult.data.deckId,
            job_id: job.id,
            question: card.question,
            answer: card.answer,
            status: "pending" as Database["public"]["Enums"]["card_status"],
          }))
        );

        if (cardsError) {
          throw cardsError;
        }

        // Update job status to succeeded
        await locals.supabase
          .from("ai_jobs")
          .update({
            status: "succeeded",
            finished_at: new Date().toISOString(),
            actual_card_count: cards.length,
            tokens_used: response.usage.total_tokens,
          })
          .eq("id", job.id);

        // Return success response
        const result: AiJobCreateResponseDto = {
          job_id: job.id,
          status: "succeeded",
        };

        return new Response(JSON.stringify(result), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("Failed to parse OpenRouter response:", parseError);
        throw new Error("Failed to parse OpenRouter response");
      }
    } catch (error) {
      console.error("OpenRouter API error:", error);

      // Update job status to failed
      await locals.supabase
        .from("ai_jobs")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      return new Response(JSON.stringify({ error: "Failed to generate cards" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error in AI job creation:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
