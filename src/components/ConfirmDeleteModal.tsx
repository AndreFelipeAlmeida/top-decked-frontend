import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  // Por padrão o modal assume uma exclusão (variante destrutiva, textos de
  // "Excluir"); outras confirmações sensíveis mas não-destrutivas (ex.: trocar
  // um ID vinculado a histórico) podem sobrescrever esses três para reaproveitar
  // o mesmo modal sem herdar o vocabulário/estilo de "exclusão".
  variant?: 'destructive' | 'default';
  confirmLabel?: string;
  loadingLabel?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
  variant = 'destructive',
  confirmLabel,
  loadingLabel,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <div className={`flex items-center gap-2 mb-2 ${variant === 'destructive' ? 'text-destructive' : 'text-primary'}`}>
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-border"
          >
            Cancelar
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
            className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingLabel ?? (variant === 'destructive' ? 'Excluindo...' : 'Confirmando...')}
              </>
            ) : (
              confirmLabel ?? (variant === 'destructive' ? 'Confirmar Exclusão' : 'Confirmar')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
