import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { Enums } from "@/db/database.types";

interface CardActionsProps {
  onStatusChange: (status: Enums<"card_status">) => void;
  className?: string;
}

export function CardActions({ onStatusChange, className = "" }: CardActionsProps) {
  return (
    <div className={`flex gap-4 ${className}`}>
      <Button
        variant="outline"
        size="lg"
        className="bg-red-600 hover:bg-red-700 text-white border-none"
        onClick={() => onStatusChange("rejected")}
      >
        <X className="mr-2 h-4 w-4" />
        Don&apos;t Know
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="bg-green-600 hover:bg-green-700 text-white border-none"
        onClick={() => onStatusChange("accepted")}
      >
        <Check className="mr-2 h-4 w-4" />
        Know It
      </Button>
    </div>
  );
}
