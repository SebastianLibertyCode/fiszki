import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { CardStatusUpdateCommand } from "@/types";

interface CardListProps {
  deckId: string;
}

interface CardDto {
  id: string;
  question: string;
  answer: string;
  status: "pending" | "accepted" | "rejected";
  source_fragment?: string;
}

interface PaginatedResponse {
  data: CardDto[];
  meta: {
    page: number;
    total: number;
  };
}

type BulkActionType = "accepted" | "rejected" | "delete";

export function CardList({ deckId }: CardListProps) {
  const queryClient = useQueryClient();
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  // Fetch cards with infinite scrolling
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery<PaginatedResponse>({
    queryKey: ["deck", deckId, "cards"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/decks/${deckId}/cards?page=${pageParam}&limit=20`);
      if (!response.ok) {
        throw new Error("Failed to fetch cards");
      }
      return response.json();
    },
    getNextPageParam: (lastPage: PaginatedResponse) => {
      if (lastPage.data.length < 20) return undefined;
      return lastPage.meta.page + 1;
    },
    initialPageParam: 1,
  });

  // Update card status mutation
  const updateCardStatusMutation = useMutation({
    mutationFn: async ({ cardId, status }: { cardId: string; status: CardStatusUpdateCommand["status"] }) => {
      const response = await fetch(`/api/decks/${deckId}/cards/${cardId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update card status");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId, "cards"] });
    },
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const response = await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete card");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId, "cards"] });
    },
  });

  const handleBulkAction = async (action: BulkActionType) => {
    if (selectedCardIds.size === 0) {
      toast.error("Please select cards first");
      return;
    }

    try {
      if (action === "delete") {
        await Promise.all([...selectedCardIds].map((id) => deleteCardMutation.mutateAsync(id)));
        toast.success(`${selectedCardIds.size} cards deleted`);
      } else {
        await Promise.all(
          [...selectedCardIds].map((id) => updateCardStatusMutation.mutateAsync({ cardId: id, status: action }))
        );
        toast.success(`${selectedCardIds.size} cards ${action}`);
      }
      setSelectedCardIds(new Set());
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} cards`);
    }
  };

  const toggleCardSelection = (cardId: string) => {
    const newSelection = new Set(selectedCardIds);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setSelectedCardIds(newSelection);
  };

  const selectAllCards = () => {
    if (!data) return;
    const allCardIds = data.pages.flatMap((page) => page.data.map((card) => card.id));
    setSelectedCardIds(new Set(allCardIds));
  };

  const deselectAllCards = () => {
    setSelectedCardIds(new Set());
  };

  if (isLoading) {
    return <div>Loading cards...</div>;
  }

  const cards = data?.pages.flatMap((page) => page.data) ?? [];
  const hasCards = cards.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cards</CardTitle>
        {hasCards && (
          <div className="flex gap-2">
            {selectedCardIds.size > 0 ? (
              <>
                <Button variant="outline" size="sm" onClick={() => deselectAllCards()}>
                  Deselect All
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("accepted")}>
                  Accept Selected
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("rejected")}>
                  Reject Selected
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleBulkAction("delete")}>
                  Delete Selected
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={selectAllCards}>
                Select All
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!hasCards ? (
          <div className="text-center text-muted-foreground py-8">No cards yet</div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <Checkbox checked={selectedCardIds.has(card.id)} onCheckedChange={() => toggleCardSelection(card.id)} />
                <div className="flex-1 space-y-2">
                  <div className="font-medium">{card.question}</div>
                  <div className="text-muted-foreground">{card.answer}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div>Status: {card.status}</div>
                    {card.source_fragment && <div>Source: {card.source_fragment}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCardStatusMutation.mutate({ cardId: card.id, status: "accepted" })}
                    disabled={card.status === "accepted"}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCardStatusMutation.mutate({ cardId: card.id, status: "rejected" })}
                    disabled={card.status === "rejected"}
                  >
                    Reject
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteCardMutation.mutate(card.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? "Loading more..." : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
