import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeckDto, DeckUpdateCommand } from "@/types";
import { toast } from "sonner";
import { DeckHeader } from "./DeckHeader";
import { CardGenerationPanel } from "./CardGenerationPanel";
import { ManageableCardList } from "./cards/ManageableCardList";

interface DeckDetailsProps {
  deckId: string;
}

export function DeckDetails({ deckId }: DeckDetailsProps) {
  const queryClient = useQueryClient();

  // Fetch deck details
  const {
    data: deck,
    isLoading,
    error,
  } = useQuery<DeckDto>({
    queryKey: ["deck", deckId],
    queryFn: async () => {
      const response = await fetch(`/api/decks/${deckId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch deck");
      }
      return response.json();
    },
  });

  // Update deck mutation
  const updateDeckMutation = useMutation({
    mutationFn: async (updateCommand: DeckUpdateCommand) => {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateCommand),
      });
      if (!response.ok) {
        throw new Error("Failed to update deck");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      toast.success("Deck updated successfully");
    },
    onError: () => {
      toast.error("Failed to update deck");
    },
  });

  // Delete deck mutation
  const deleteDeckMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete deck");
      }
    },
    onSuccess: () => {
      toast.success("Deck deleted successfully");
      document.querySelector<HTMLAnchorElement>('a[href="/decks"]')?.click();
    },
    onError: () => {
      toast.error("Failed to delete deck");
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading deck</div>;
  }

  if (!deck) {
    return <div>Deck not found</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <DeckHeader
        deck={deck}
        onEdit={(updateCommand) => updateDeckMutation.mutate(updateCommand)}
        onDelete={() => deleteDeckMutation.mutate()}
      />
      <CardGenerationPanel deckId={deckId} />
      <ManageableCardList deckId={deckId} />
      <a href="/decks" className="sr-only" aria-hidden="true">
        Return to decks list
      </a>
    </div>
  );
}
