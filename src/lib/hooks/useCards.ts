import { useCallback, useState } from "react";
import type { CardDto } from "@/types";

interface UseCardsOptions {
  initialCards?: CardDto[];
}

export function useCards(deckId: string, options: UseCardsOptions = {}) {
  const [cards, setCards] = useState<CardDto[]>(options.initialCards ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCards = useCallback(async () => {
    if (!deckId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/decks/${deckId}/cards?status=pending&page=1&limit=50`);

      if (!response.ok) {
        throw new Error(`Failed to fetch cards: ${response.statusText}`);
      }

      const data = await response.json();
      setCards(data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch cards"));
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  const addCard = useCallback(
    async (card: { question: string; answer: string }) => {
      if (!deckId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/decks/${deckId}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card),
        });

        if (!response.ok) {
          throw new Error(`Failed to add card: ${response.statusText}`);
        }

        await fetchCards(); // Refresh the list after adding
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to add card"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [deckId, fetchCards]
  );

  const updateCard = useCallback(
    async (cardId: string, card: { question: string; answer: string }) => {
      if (!deckId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card),
        });

        if (!response.ok) {
          throw new Error(`Failed to update card: ${response.statusText}`);
        }

        await fetchCards(); // Refresh the list after updating
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to update card"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [deckId, fetchCards]
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      if (!deckId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to delete card: ${response.statusText}`);
        }

        await fetchCards(); // Refresh the list after deleting
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to delete card"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [deckId, fetchCards]
  );

  return {
    cards,
    isLoading,
    error,
    refetch: fetchCards,
    addCard,
    updateCard,
    deleteCard,
  };
}
