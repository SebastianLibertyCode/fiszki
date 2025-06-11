import { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Keyboard } from "lucide-react";

interface StudySummaryProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalCards: number;
    knownCards: number;
    unknownCards: number;
    elapsedTime: number;
  };
}

export function StudySummary({ isOpen, onClose, stats }: StudySummaryProps) {
  const { totalCards, knownCards, unknownCards, elapsedTime } = stats;
  const knownPercentage = Math.round((knownCards / totalCards) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "Enter":
        window.location.reload(); // Study again
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Study Session Complete!
          </DialogTitle>
          <DialogDescription>Here&apos;s how you did in this session</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Success Rate</span>
              <span className="font-medium">{knownPercentage}%</span>
            </div>
            <Progress value={knownPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-green-500">{knownCards}</div>
              <div className="text-sm text-gray-500">Cards Known</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-red-500">{unknownCards}</div>
              <div className="text-sm text-gray-500">Need Review</div>
            </div>
            <div className="space-y-1 col-span-2">
              <div className="text-2xl font-semibold">{formatTime(elapsedTime)}</div>
              <div className="text-sm text-gray-500">Total Time</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Keyboard className="h-4 w-4" />
            <span>Press Enter to study again, Esc to close</span>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => window.location.reload()}>Study Again</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
