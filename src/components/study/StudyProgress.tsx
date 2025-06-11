import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StudyProgressProps {
  currentIndex: number;
  totalCards: number;
  className?: string;
}

export function StudyProgress({ currentIndex, totalCards, className }: StudyProgressProps) {
  const progress = ((currentIndex + 1) / totalCards) * 100;

  return (
    <div className={cn("w-full max-w-md", className)}>
      <Progress value={progress} className="h-2" />
      <p className="text-center text-sm text-white mt-2">
        {currentIndex + 1} / {totalCards}
      </p>
    </div>
  );
}
