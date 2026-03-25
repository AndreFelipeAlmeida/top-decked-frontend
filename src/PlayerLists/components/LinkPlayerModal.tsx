import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { JogadorPublico } from '@/types/Player';

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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log('Vincular jogador:', {
      player,
      nickname: data.nickname,
    });

    reset();
    onClose();
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular {player.nome} à loja</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Info do jogador */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Jogador</p>
            <p className="font-medium text-gray-900">{player.nome}</p>
          </div>

          {/* Apelido */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              Apelido (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Joãozinho"
              {...register('nickname')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />

            {errors.nickname && (
              <p className="text-sm text-red-500 mt-1">
                {errors.nickname.message}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <Button type="submit">Vincular jogador</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
