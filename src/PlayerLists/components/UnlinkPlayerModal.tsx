import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import type { PaginatedJogadorPublico } from '@/types/Player';
import { useUnlinkPlayer } from '@/hooks/credits.hooks';
import { toast } from 'sonner';
import { useAuthContext } from '@/hooks/authContext.hooks';

type Props = {
  open: boolean;
  onClose: () => void;
  player: PaginatedJogadorPublico | null;
};

export default function UnlinkPlayerToStoreModal({
  open,
  onClose,
  player,
}: Props) {
  const { user } = useAuthContext();

  const { mutate, isPending } = useUnlinkPlayer();

  if (!player) return null;

  const handleConfirm = (player: PaginatedJogadorPublico) => {
    mutate(player.id, {
      onSuccess: () => {
        toast.success('Jogador desvinculado');
        onClose();
      },
    });
  };

  const credito = player.lojas?.find((c) => c.loja_id === user?.id)?.creditos;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Desvincular jogador</DialogTitle>
          <DialogDescription>Confirme a ação abaixo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Créditos atuais:{' '}
            <span className="font-semibold text-primary">
              {credito ?? 0}
            </span>
          </p>

          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja desvincular{' '}
            <span className="font-semibold text-foreground">{player.nome}</span>{' '}
            da loja?
          </p>

          <p className="text-xs text-destructive">
            Essa ação não pode ser desfeita.
          </p>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleConfirm(player)}
              disabled={isPending}
            >
              {isPending ? 'Desvinculando...' : 'Desvincular'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
