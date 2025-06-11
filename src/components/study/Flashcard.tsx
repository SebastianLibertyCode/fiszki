import type { StudyCardDto } from "@/types";
import { Card } from "@/components/ui/card";

interface FlashcardProps {
  card: StudyCardDto;
  isFlipped: boolean;
  onClick: () => void;
}

export function Flashcard({ card, isFlipped, onClick }: FlashcardProps) {
  return (
    <button
      className="w-[600px] h-[400px] cursor-pointer [perspective:1000px]"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Flashcard: ${isFlipped ? "Answer" : "Question"}`}
      aria-pressed={isFlipped}
    >
      <div
        className={`
          relative w-full h-full transition-transform duration-700
          [transform-style:preserve-3d]
          ${isFlipped ? "[transform:rotateY(180deg)]" : ""}
        `}
      >
        {/* Front */}
        <Card className="absolute inset-0 flex items-center justify-center p-8 [backface-visibility:hidden]">
          <p className="text-2xl text-center">{card.front}</p>
        </Card>

        {/* Back */}
        <Card className="absolute inset-0 flex items-center justify-center p-8 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <p className="text-2xl text-center">{card.back}</p>
        </Card>
      </div>
    </button>
  );
}
