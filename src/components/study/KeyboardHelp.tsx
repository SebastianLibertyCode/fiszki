import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyboardHelpProps {
  className?: string;
}

export function KeyboardHelp({ className }: KeyboardHelpProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={cn("text-white hover:text-white/80", className)}>
            <Keyboard className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          <div className="space-y-2">
            <h3 className="font-semibold">Keyboard Shortcuts</h3>
            <div className="text-sm">
              <p>← Previous card</p>
              <p>→ Next card</p>
              <p>Space Toggle card</p>
              <p>Esc Exit study mode</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
