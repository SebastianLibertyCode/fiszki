import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DeckList } from "./DeckList";
import { DeckCreateModal } from "./DeckCreateModal";
import { useDecks } from "@/lib/hooks/useDecks";

export default function DecksDashboard() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { decks, loading, error, hasMore, loadMore, refresh } = useDecks({ categories: selectedCategories });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <Sidebar
            selectedCategories={selectedCategories}
            onChange={setSelectedCategories}
            onReset={() => setSelectedCategories([])}
          />
        </aside>
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Your Decks</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              Create Deck
            </button>
          </div>
          <DeckList decks={decks} loading={loading} error={error} hasMore={hasMore} onLoadMore={loadMore} />
        </main>
      </div>

      <DeckCreateModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={refresh} />
    </div>
  );
}
