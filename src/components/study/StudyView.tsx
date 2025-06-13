import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { StudySummary } from "./StudySummary";
import { CardActions } from "./CardActions";
import { fireConfetti } from "@/lib/utils";
import type { StudySession, StudyCardDto } from "@/types";
import type { Enums } from "@/db/database.types";
import { Flashcard } from "./Flashcard";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "./ErrorBoundary";
import { CardSkeleton } from "./CardSkeleton";
import { KeyboardHelp } from "./KeyboardHelp";
import { StudyProgress } from "./StudyProgress";
import { StudyStats } from "./StudyStats";
import { StudyHistory } from "./StudyHistory";
import { Toaster } from "sonner";

interface StudyViewProps {
  deckId: string;
}

function useStudyCards(deckId: string) {
  const [cards, setCards] = useState<StudyCardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      const response = await fetch(`/api/decks/${deckId}/cards/study`);
      if (!response.ok) {
        throw new Error("Failed to fetch cards");
      }
      const data = await response.json();
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    cards,
    loading,
    error,
    retry: fetchCards,
  };
}

function StudyViewContent({ deckId }: StudyViewProps) {
  const { cards, loading, error, retry: fetchCards } = useStudyCards(deckId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState(0);
  const [unknownCards, setUnknownCards] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const historyRef = useRef<{ saveSession: (session: StudySession) => void }>(null);

  const currentCard = cards[currentIndex];
  const hasCards = cards.length > 0;
  const isLastCard = currentIndex === cards.length - 1;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStatusChange = async (status: Enums<"card_status">) => {
    try {
      const response = await fetch(`/api/cards/${currentCard.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card status");
      }

      if (status === "accepted") {
        setKnownCards((prev) => prev + 1);
        toast.success("Card marked as known");
      } else if (status === "rejected") {
        setUnknownCards((prev) => prev + 1);
        toast.error("Card marked for review");
      }

      if (isLastCard) {
        const session: StudySession = {
          totalCards: cards.length,
          knownCards: knownCards + (status === "accepted" ? 1 : 0),
          unknownCards: unknownCards + (status === "rejected" ? 1 : 0),
          duration: elapsedTime,
        };
        historyRef.current?.saveSession(session);

        fireConfetti();
        setShowSummary(true);
      } else {
        goToNext();
      }
    } catch (error) {
      console.error("Error updating card status:", error);
      toast.error("Failed to update card status");
    }
  };

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setShowActions(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setShowActions(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, cards.length]);

  const toggleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setShowActions(true);
    }
  }, [isFlipped]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      else if (e.key === "ArrowRight") goToNext();
      else if (e.key === " ") toggleFlip();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext, toggleFlip]);

  useEffect(() => {
    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center gap-4">
        <p className="text-white">{error}</p>
        <Button onClick={fetchCards} variant="secondary">
          Try Again
        </Button>
      </div>
    );
  }

  if (!hasCards) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <p className="text-white">No cards to study</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center p-4">
        <StudyHistory ref={historyRef} />
        <StudyStats totalCards={cards.length} knownCards={knownCards} unknownCards={unknownCards} />
        <Button
          variant="ghost"
          className="text-white hover:text-white"
          onClick={() => (window.location.href = `/decks/${deckId}`)}
          aria-label="Exit study mode"
        >
          ×
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex items-center justify-center relative">
        <KeyboardHelp className="absolute top-4 left-4" />

        <Button
          variant="ghost"
          className="absolute left-4 text-white hover:text-white"
          onClick={goToPrev}
          disabled={currentIndex === 0}
          aria-label="Previous card"
        >
          ←
        </Button>

        <div className="flex flex-col items-center gap-8">
          <Flashcard card={currentCard} isFlipped={isFlipped} onClick={toggleFlip} />

          <div
            className={`
              transition-opacity duration-300 ease-in-out
              ${showActions ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            <CardActions onStatusChange={handleStatusChange} />
          </div>
        </div>

        <Button
          variant="ghost"
          className="absolute right-4 text-white hover:text-white"
          onClick={goToNext}
          disabled={isLastCard}
          aria-label="Next card"
        >
          →
        </Button>
      </div>

      {/* Bottom Bar */}
      <div className="w-full p-4">
        <StudyProgress currentIndex={currentIndex} totalCards={cards.length} className="mx-auto" />
      </div>

      <StudySummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        stats={{
          totalCards: cards.length,
          knownCards,
          unknownCards,
          elapsedTime,
        }}
      />
      <Toaster />
    </div>
  );
}

export function StudyView(props: StudyViewProps) {
  return (
    <ErrorBoundary>
      <StudyViewContent {...props} />
    </ErrorBoundary>
  );
}
