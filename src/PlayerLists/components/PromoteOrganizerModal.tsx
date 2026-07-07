import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePromoteJogadorOrganizador, useDemoteJogadorOrganizador } from '@/hooks/store.hooks';
import type { PaginatedJogadorPublico } from '@/types/Player';

type Props = {
  open: boolean;
  onClose: () => void;
  player: PaginatedJogadorPublico | null;
  tcg: string | null;
  action: 'promover' | 'despromover' | null;
};

export default function PromoteOrganizerModal({ open, onClose, player, tcg, action }: Props) {
  const promoteMutation = usePromoteJogadorOrganizador();
  const demoteMutation = useDemoteJogadorOrganizador();

  if (!player || !tcg || !action) return null;

  const isPromoting = action === 'promover';
  const mutation = isPromoting ? promoteMutation : demoteMutation;

  const handleConfirm = () => {
    mutation.mutate(
      { jogadorId: player.id, tcg },
      {
        onSuccess: () => {
          toast.success(
            isPromoting
              ? `${player.nome} agora é organizador de ${tcg} nesta loja`
              : `${player.nome} não é mais organizador de ${tcg} nesta loja`,
          );
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isPromoting ? 'Promover a organizador' : 'Remover organizador'}
          </DialogTitle>
          <DialogDescription>Confirme a ação abaixo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isPromoting ? (
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja promover{' '}
              <span className="font-semibold text-foreground">{player.nome}</span> a organizador
              de <span className="font-semibold text-foreground">{tcg}</span> nesta loja? Ele
              passará a poder criar e gerenciar torneios de {tcg} em nome desta loja.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja remover{' '}
              <span className="font-semibold text-foreground">{player.nome}</span> como
              organizador de <span className="font-semibold text-foreground">{tcg}</span> nesta
              loja? Ele deixará de poder gerenciar torneios de {tcg} em nome desta loja.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <Button
              variant={isPromoting ? 'default' : 'destructive'}
              onClick={handleConfirm}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Salvando...' : isPromoting ? 'Promover' : 'Remover'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
