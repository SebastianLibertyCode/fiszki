import { useState, useEffect } from "react";
import type { DeckSummaryDto, PaginatedDto } from "@/types";

interface UseDecksOptions {
  categories?: string[];
  page?: number;
  limit?: number;
}

interface UseDecksReturn {
  decks: DeckSummaryDto[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useDecks({ categories = [], page = 1, limit = 12 }: UseDecksOptions = {}): UseDecksReturn {
  const [decks, setDecks] = useState<DeckSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchDecks = async (pageToFetch: number) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: limit.toString(),
        ...(categories.length > 0 && { categories: categories.join(",") }),
      });

      const response = await fetch(`/api/decks?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch decks");
      }

      const data: PaginatedDto<DeckSummaryDto> = await response.json();

      if (pageToFetch === 1) {
        setDecks(data.data);
      } else {
        setDecks((prev) => [...prev, ...data.data]);
      }

      setHasMore(data.data.length === limit);
      setCurrentPage(pageToFetch);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching decks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchDecks(1);
  }, [categories.join(",")]);

  const loadMore = async () => {
    if (!loading && hasMore) {
      await fetchDecks(currentPage + 1);
    }
  };

  const refresh = async () => {
    setCurrentPage(1);
    await fetchDecks(1);
  };

  return {
    decks,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
