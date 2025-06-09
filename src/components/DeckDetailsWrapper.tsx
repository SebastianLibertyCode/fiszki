import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DeckDetails } from "./DeckDetails";

interface DeckDetailsWrapperProps {
  deckId: string;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

export function DeckDetailsWrapper({ deckId }: DeckDetailsWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DeckDetails deckId={deckId} />
    </QueryClientProvider>
  );
}
