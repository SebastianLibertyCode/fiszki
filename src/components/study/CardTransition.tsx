import { useEffect, useState, type ReactNode } from "react";

interface CardTransitionProps {
  children: ReactNode;
  direction: "left" | "right" | null;
}

export function CardTransition({ children, direction }: CardTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [nextChildren, setNextChildren] = useState<ReactNode | null>(null);

  useEffect(() => {
    if (children !== currentChildren) {
      setIsAnimating(true);
      setNextChildren(children);

      const timer = setTimeout(() => {
        setCurrentChildren(children);
        setNextChildren(null);
        setIsAnimating(false);
      }, 300); // Match this with CSS transition duration

      return () => clearTimeout(timer);
    }
  }, [children, currentChildren]);

  if (!isAnimating) {
    return <div className="relative w-full h-full">{currentChildren}</div>;
  }

  const currentClass = direction === "right" ? "animate-slide-out-left" : "animate-slide-out-right";

  const nextClass = direction === "right" ? "animate-slide-in-right" : "animate-slide-in-left";

  return (
    <div className="relative w-full h-full">
      <div className={`absolute inset-0 ${currentClass}`}>{currentChildren}</div>
      <div className={`absolute inset-0 ${nextClass}`}>{nextChildren}</div>
    </div>
  );
}
