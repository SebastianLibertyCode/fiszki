import { useState } from "react";
import type { DeckDto, DeckUpdateCommand } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen } from "lucide-react";

interface DeckHeaderProps {
  deck: DeckDto;
  onEdit: (updateCommand: DeckUpdateCommand) => void;
  onDelete: () => void;
}

export function DeckHeader({ deck, onEdit, onDelete }: DeckHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    card_limit: string;
  }>({
    name: deck.name,
    description: deck.description || "",
    card_limit: deck.card_limit?.toString() || "",
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit({
      name: editForm.name,
      description: editForm.description || null,
      card_limit: editForm.card_limit ? parseInt(editForm.card_limit) : null,
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
  };

  const handleStartStudy = () => {
    window.location.href = `/decks/${deck.id}/study`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{deck.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{deck.description}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleStartStudy} className="gap-2">
            <BookOpen className="h-4 w-4" />
            Start Study
          </Button>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Deck</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardLimit">Card Limit</Label>
                  <Input
                    id="cardLimit"
                    type="number"
                    min={1}
                    value={editForm.card_limit}
                    onChange={(e) => setEditForm({ ...editForm, card_limit: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Deck</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this deck? This action cannot be undone.</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>Cards: {deck.card_limit || "Unlimited"}</div>
          <div>Created: {new Date(deck.created_at).toLocaleDateString()}</div>
          <div>Updated: {new Date(deck.updated_at).toLocaleDateString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
