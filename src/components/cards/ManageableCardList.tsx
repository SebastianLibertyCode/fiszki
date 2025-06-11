import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CardList } from "./CardList";
import { CardModal } from "./CardModal";
import { useCards } from "@/lib/hooks/useCards";
import type { CardDto } from "@/types";
import type { CardFormValues } from "@/lib/schemas/card";
import { useEffect } from "react";

interface ManageableCardListProps {
  deckId: string;
}

export function ManageableCardList({ deckId }: ManageableCardListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardDto | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { cards, isLoading, error, addCard, updateCard, deleteCard, refetch } = useCards(deckId);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleAddCard = async (values: CardFormValues) => {
    try {
      setIsSubmitting(true);
      await addCard(values);
      setIsModalOpen(false);
      toast.success("Card added successfully");
    } catch {
      toast.error("Failed to add card");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCard = async (values: CardFormValues) => {
    if (!editingCard) return;

    try {
      setIsSubmitting(true);
      await updateCard(editingCard.id, values);
      setIsModalOpen(false);
      setEditingCard(undefined);
      toast.success("Card updated successfully");
    } catch {
      toast.error("Failed to update card");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard(cardId);
      toast.success("Card deleted successfully");
    } catch {
      toast.error("Failed to delete card");
    }
  };

  const handleEdit = (card: CardDto) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div>Loading cards...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive py-8">Error loading cards. Please try again later.</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cards</CardTitle>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </CardHeader>
      <CardContent>
        <CardList cards={cards} onEdit={handleEdit} onDelete={handleDeleteCard} />
      </CardContent>

      <CardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(undefined);
        }}
        onSubmit={editingCard ? handleEditCard : handleAddCard}
        initialValues={editingCard}
        isSubmitting={isSubmitting}
        mode={editingCard ? "edit" : "create"}
      />
    </Card>
  );
}
