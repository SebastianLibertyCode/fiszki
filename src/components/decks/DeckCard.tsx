import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DeckSummaryDto } from "@/types";

interface DeckCardProps {
  deck: DeckSummaryDto;
  onClick: (id: string) => void;
}

export function DeckCard({ deck, onClick }: DeckCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(deck.created_at));

  return (
    <Card className="hover:bg-accent/5 transition-colors">
      <CardHeader>
        <CardTitle className="text-xl">{deck.name}</CardTitle>
        <CardDescription>{deck.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p>Created: {formattedDate}</p>
          {deck.card_limit && <p>Card limit: {deck.card_limit}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={() => onClick(deck.id)}>View Deck</Button>
      </CardFooter>
    </Card>
  );
}
