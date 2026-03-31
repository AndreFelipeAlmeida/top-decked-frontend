import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import type { PaginatedJogadorPublico } from '@/types/Player';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unlinkPlayer } from '@/services/creditoService';
import { toast } from 'sonner';
import { useAuthContext } from '@/hooks/useAuthContext';

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
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const { mutate, isPending } = useMutation({
    mutationFn: unlinkPlayer,
    onSuccess: () => {
      toast.success('Jogador desvinculado');
      queryClient.invalidateQueries({ queryKey: ['players'] });
      onClose();
    },
  });

  if (!player) return null;

  const handleConfirm = (player: PaginatedJogadorPublico) => {
    mutate(player.id);
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
          <p className="text-sm text-gray-600">
            Créditos atuais:{' '}
            <span className="font-semibold text-purple-600">
              {credito ?? 0}
            </span>
          </p>

          <p className="text-sm text-gray-600">
            Tem certeza que deseja desvincular{' '}
            <span className="font-semibold text-gray-900">{player.nome}</span>{' '}
            da loja?
          </p>

          <p className="text-xs text-red-500">
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
