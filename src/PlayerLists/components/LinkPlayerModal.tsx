import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { JogadorPublico } from '@/types/Player';
import { useLinkExistingPlayer } from '@/hooks/credits.hooks';
import { toast } from 'sonner';

const schema = z.object({
  nickname: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  player: JogadorPublico | null;
};

export default function LinkPlayerToStoreModal({
  open,
  onClose,
  player,
}: Props) {
  const { mutate } = useLinkExistingPlayer();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    if (!player) return;

    mutate(
      { jogadorId: player.id, apelido: data.nickname },
      {
        onSuccess: () => {
          toast.success('Jogador vinculado com sucesso');
          onClose();
        },
      },
    );
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular {player.nome} à loja</DialogTitle>
          <DialogDescription>Confirme a ação abaixo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Info do jogador */}
          <div className="bg-muted/40 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Jogador</p>
            <p className="font-medium text-foreground">{player.nome}</p>
          </div>

          {/* Apelido */}
          <div>
            <label className="block text-sm mb-2 text-muted-foreground">
              Apelido (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Joãozinho"
              {...register('nickname')}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {errors.nickname && (
              <p className="text-sm text-destructive mt-1">
                {errors.nickname.message}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <Button
              className="bg-primary text-white hover:bg-primary/90"
              type="submit"
            >
              Vincular jogador
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
