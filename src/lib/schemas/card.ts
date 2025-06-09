import { z } from "zod";

export const cardFormSchema = z.object({
  question: z.string().min(1, "Question is required").max(200, "Question must be at most 200 characters"),
  answer: z.string().min(1, "Answer is required").max(500, "Answer must be at most 500 characters"),
});

export type CardFormValues = z.infer<typeof cardFormSchema>;
