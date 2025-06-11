import { forwardRef, useImperativeHandle, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface StudySession {
  totalCards: number;
  knownCards: number;
  unknownCards: number;
  duration: number;
  timestamp?: number;
}

interface StudyHistoryHandle {
  saveSession: (session: StudySession) => void;
}

export const StudyHistory = forwardRef<StudyHistoryHandle>((_, ref) => {
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem("study-history");
    return saved ? JSON.parse(saved) : [];
  });

  useImperativeHandle(ref, () => ({
    saveSession: (session: StudySession) => {
      const newSession = {
        ...session,
        timestamp: Date.now(),
      };
      const updatedSessions = [newSession, ...sessions].slice(0, 100); // Keep last 100 sessions
      setSessions(updatedSessions);
      localStorage.setItem("study-history", JSON.stringify(updatedSessions));
    },
  }));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="absolute top-4 left-4 text-white hover:text-white">
          History
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Study History</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-6rem)] mt-4">
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div key={session.timestamp || index} className="p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground">
                  {session.timestamp ? formatDistanceToNow(session.timestamp, { addSuffix: true }) : "Unknown time"}
                </div>
                <div className="mt-2 space-y-1">
                  <p>Total cards: {session.totalCards}</p>
                  <p className="text-green-600">Known: {session.knownCards}</p>
                  <p className="text-red-600">Unknown: {session.unknownCards}</p>
                  <p>Duration: {Math.round(session.duration / 60)} minutes</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
});

StudyHistory.displayName = "StudyHistory";
