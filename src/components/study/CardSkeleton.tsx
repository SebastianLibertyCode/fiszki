import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="relative w-80 h-48">
      <div className="absolute inset-0 bg-white rounded-lg p-4">
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
