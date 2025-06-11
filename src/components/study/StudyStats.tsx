import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";

interface StudyStatsProps {
  totalCards: number;
  knownCards: number;
  unknownCards: number;
  className?: string;
}

export function StudyStats({ totalCards, knownCards, unknownCards, className = "" }: StudyStatsProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isKnownAnimating, setIsKnownAnimating] = useState(false);
  const [isUnknownAnimating, setIsUnknownAnimating] = useState(false);
  const remainingCards = totalCards - (knownCards + unknownCards);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsKnownAnimating(true);
    const timer = setTimeout(() => setIsKnownAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [knownCards]);

  useEffect(() => {
    setIsUnknownAnimating(true);
    const timer = setTimeout(() => setIsUnknownAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [unknownCards]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={`bg-gray-800 text-white ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Timer className="h-4 w-4" />
          {formatTime(elapsedTime)}
        </CardTitle>
        <CardDescription className="text-gray-400">Study Session Progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className={`
              bg-green-600 transition-all duration-300
              ${isKnownAnimating ? "scale-110" : "scale-100"}
            `}
          >
            Known: {knownCards}
          </Badge>
          <Badge
            variant="secondary"
            className={`
              bg-red-600 transition-all duration-300
              ${isUnknownAnimating ? "scale-110" : "scale-100"}
            `}
          >
            Unknown: {unknownCards}
          </Badge>
          <Badge variant="secondary" className="bg-gray-600">
            Remaining: {remainingCards}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
