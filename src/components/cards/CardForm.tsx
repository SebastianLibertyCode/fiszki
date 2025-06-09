import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cardFormSchema, type CardFormValues } from "@/lib/schemas/card";

interface CardFormProps {
  initialValues?: CardFormValues;
  onSubmit: (values: CardFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CardForm({ initialValues, onSubmit, onCancel, isSubmitting = false }: CardFormProps) {
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: initialValues ?? {
      question: "",
      answer: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch {
      // Error handling is done by the parent component
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="Enter the question" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter the answer" className="min-h-[100px]" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
