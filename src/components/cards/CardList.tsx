import type { CardDto } from "@/types";
import { CardItem } from "./CardItem";

interface CardListProps {
  cards: CardDto[];
  onEdit: (card: CardDto) => void;
  onDelete: (cardId: string) => void;
}

export function CardList({ cards, onEdit, onDelete }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">No cards found. Add your first card to get started!</div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
