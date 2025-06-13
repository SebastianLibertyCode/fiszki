import { useEffect, useRef, useCallback } from "react";
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

  const handleDeckClick = (id: string) => {
    window.location.href = `/decks/${id}`;
  };

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    if (lastDeckRef.current) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: "20px",
        threshold: 0.1,
      });

      observerRef.current.observe(lastDeckRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [decks.length, handleObserver]);

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
