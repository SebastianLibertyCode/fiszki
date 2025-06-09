import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import type { CardDto } from "@/types";

interface CardItemProps {
  card: CardDto;
  onEdit: (card: CardDto) => void;
  onDelete: (cardId: string) => void;
}

export function CardItem({ card, onEdit, onDelete }: CardItemProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Question</h3>
            <p className="mt-1 text-lg">{card.question}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Answer</h3>
            <p className="mt-1 text-lg">{card.answer}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        <Button variant="outline" size="icon" onClick={() => onEdit(card)} aria-label="Edit card">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onDelete(card.id)} aria-label="Delete card">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
