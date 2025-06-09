import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardForm } from "./CardForm";
import type { CardFormValues } from "@/lib/schemas/card";
import type { CardDto } from "@/types";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CardFormValues) => Promise<void>;
  initialValues?: CardDto;
  isSubmitting?: boolean;
  mode: "create" | "edit";
}

export function CardModal({ isOpen, onClose, onSubmit, initialValues, isSubmitting = false, mode }: CardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Card" : "Edit Card"}</DialogTitle>
        </DialogHeader>
        <CardForm initialValues={initialValues} onSubmit={onSubmit} onCancel={onClose} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
