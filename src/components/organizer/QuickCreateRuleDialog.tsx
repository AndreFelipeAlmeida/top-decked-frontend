import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useCreatePlayerType, useCreatePlayerTypeAsOrganizer } from '@/hooks/playerTypes.hooks';
import { playerTypeSchema, parseNumeroComVirgula, type PlayerTypeForm } from '@/schemas/playerType.schemas';
import {
  oponenteGanhaTooltip,
  oponenteEmpataTooltip,
  oponentePerdeTooltip,
} from '@/lib/playerTypeTooltips';

const emptyRule: PlayerTypeForm = {
  nome: '',
  pt_vitoria: 3,
  pt_derrota: 0,
  pt_empate: 1,
  pt_oponente_perde: 0,
  pt_oponente_ganha: 0,
  pt_oponente_empate: 0,
  tcg: 'POKEMON',
};

type QuickCreateRuleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Loja usa o token de loja direto (POST /lojas/tipoJogador/); jogador
  // organizador precisa informar em nome de qual loja está criando (POST
  // /lojas/tipoJogador/organizador, que exige loja_id no corpo).
  isJogadorOrganizador: boolean;
  lojaId?: number;
  defaultTcg: string;
  onCreated: (regraId: number) => void;
};

export function QuickCreateRuleDialog({
  open,
  onOpenChange,
  isJogadorOrganizador,
  lojaId,
  defaultTcg,
  onCreated,
}: QuickCreateRuleDialogProps) {
  const { register, handleSubmit, reset } = useForm<PlayerTypeForm>({
    resolver: zodResolver(playerTypeSchema),
    values: { ...emptyRule, tcg: defaultTcg || emptyRule.tcg },
  });

  const createMutationLoja = useCreatePlayerType();
  const createMutationOrganizador = useCreatePlayerTypeAsOrganizer();
  const isPending = isJogadorOrganizador ? createMutationOrganizador.isPending : createMutationLoja.isPending;

  const onSubmit = (data: PlayerTypeForm) => {
    const handleSuccess = (novaRegra: { id: number }) => {
      reset(emptyRule);
      onOpenChange(false);
      onCreated(novaRegra.id);
    };

    if (isJogadorOrganizador) {
      if (!lojaId) return;
      createMutationOrganizador.mutate({ ...data, loja_id: lojaId }, { onSuccess: handleSuccess });
    } else {
      createMutationLoja.mutate(data, { onSuccess: handleSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Regra de Pontuação</DialogTitle>
          <DialogDescription>
            Crie rapidamente um conjunto de regras para usar neste torneio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">Nome do Conjunto de Regras</label>
            <input
              type="text"
              {...register('nome')}
              placeholder="Ex: Liga Semanal"
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">Valores de Pontuação</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Vitória</label>
                <input
                  type="text"
                  inputMode="decimal"
                  {...register('pt_vitoria', { setValueAs: parseNumeroComVirgula })}
                  className="w-full px-3 py-2 border border-border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Empate</label>
                <input
                  type="text"
                  inputMode="decimal"
                  {...register('pt_empate', { setValueAs: parseNumeroComVirgula })}
                  className="w-full px-3 py-2 border border-border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Derrota</label>
                <input
                  type="text"
                  inputMode="decimal"
                  {...register('pt_derrota', { setValueAs: parseNumeroComVirgula })}
                  className="w-full px-3 py-2 border border-border rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">Bônus de Oponente (Especial)</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="flex items-center gap-1 text-sm mb-1 text-muted-foreground">
                  Oponente Ganha
                  <InfoTooltip text={oponenteGanhaTooltip} />
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  {...register('pt_oponente_ganha', { setValueAs: parseNumeroComVirgula })}
                  className="w-full px-3 py-2 border border-border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm mb-1 text-muted-foreground">
                  Oponente Empata
                  <InfoTooltip text={oponenteEmpataTooltip} />
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  {...register('pt_oponente_empate', { setValueAs: parseNumeroComVirgula })}
                  className="w-full px-3 py-2 border border-border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm mb-1 text-muted-foreground">
                  Oponente Perde
                  <InfoTooltip text={oponentePerdeTooltip} />
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  {...register('pt_oponente_perde', { setValueAs: parseNumeroComVirgula })}
                  className="w-full px-3 py-2 border border-border rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar Regra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
