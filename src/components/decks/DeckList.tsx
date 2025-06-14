import { useEffect, useRef, useState } from "react";
import type { DeckSummaryDto } from "@/types";
import { DeckCard } from "./DeckCard";
import { Skeleton } from "@/components/ui/skeleton";

interface DeckListProps {
  decks: DeckSummaryDto[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
}

export function DeckList({ decks, loading, error, hasMore, onLoadMore }: DeckListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastDeckRef = useRef<HTMLDivElement>(null);
  const [navigateTo, setNavigateTo] = useState<string | null>(null);

  const handleDeckClick = (id: string) => {
    setNavigateTo(`/decks/${id}`);
  };

  useEffect(() => {
    if (navigateTo) {
      window.location.href = navigateTo;
    }
  }, [navigateTo]);

  useEffect(() => {
    const observer = observerRef.current;
    const lastDeck = lastDeckRef.current;

    if (!hasMore || !lastDeck) return;

    if (observer) observer.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    if (lastDeck) observerRef.current.observe(lastDeck);

    return () => {
      if (observer) observer.disconnect();
    };
  }, [hasMore, onLoadMore]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  if (!loading && decks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xl font-semibold mb-2">No decks found</p>
        <p className="text-muted-foreground">Create your first deck to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck, index) => (
          <div key={deck.id} ref={index === decks.length - 1 ? lastDeckRef : null}>
            <DeckCard deck={deck} onClick={handleDeckClick} />
          </div>
        ))}
        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          ))}
      </div>
    </div>
  );
}
