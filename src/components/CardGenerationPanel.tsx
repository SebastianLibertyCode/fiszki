import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { AiJobCreateCommand, AiJobCreateResponseDto } from "@/types";
import { Loader2 } from "lucide-react";

const MAX_TEXT_LENGTH = 10000;

interface CardGenerationPanelProps {
  deckId: string;
}

export function CardGenerationPanel({ deckId }: CardGenerationPanelProps) {
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState("");
  const [cardCount, setCardCount] = useState<number>(5);

  const generateCardsMutation = useMutation({
    mutationFn: async (command: AiJobCreateCommand) => {
      const response = await fetch(`/api/decks/${deckId}/ai-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start AI generation");
      }

      return response.json() as Promise<AiJobCreateResponseDto>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId, "cards"] });
      toast.success("AI generation started", {
        description: "Your cards will appear in the list below once they're ready.",
      });
      setInputText("");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to start AI generation");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.length === 0) {
      toast.error("Please enter some text to generate cards from");
      return;
    }
    if (cardCount < 1) {
      toast.error("Please enter a valid number of cards to generate");
      return;
    }
    generateCardsMutation.mutate({
      input_text: inputText,
      requested_card_count: cardCount,
    });
  };

  const characterCount = inputText.length;
  const isOverLimit = characterCount > MAX_TEXT_LENGTH;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Cards with AI</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inputText">Input Text</Label>
            <div className="relative">
              <Textarea
                id="inputText"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter or paste text to generate flashcards from..."
                className={`min-h-[200px] ${isOverLimit ? "border-red-500" : ""}`}
                disabled={generateCardsMutation.isPending}
              />
              <div className={`text-sm mt-1 text-right ${isOverLimit ? "text-red-500" : "text-muted-foreground"}`}>
                {characterCount}/{MAX_TEXT_LENGTH}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardCount">Number of Cards</Label>
            <Input
              id="cardCount"
              type="number"
              min={1}
              value={cardCount}
              onChange={(e) => setCardCount(parseInt(e.target.value) || 1)}
              className="w-32"
              disabled={generateCardsMutation.isPending}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isOverLimit || generateCardsMutation.isPending || characterCount === 0}
              className="min-w-[140px]"
            >
              {generateCardsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Cards"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
