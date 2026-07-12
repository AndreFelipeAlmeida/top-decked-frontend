import { useForm, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTemporada, useCreateTemporadaOrganizador } from '@/hooks/temporadas.hooks';
import { temporadaSchema, MESES, type TemporadaForm } from '@/schemas/temporada.schemas';
import type { TemporadaPublico } from '@/types/Temporada';
import type { LojaJogadorPublico } from '@/types/Credito';
import { useState } from 'react';

const valoresPadrao: TemporadaForm = {
  nome: '',
  mes_inicio: 9,
  ano_inicio: new Date().getFullYear(),
  mes_fim: 8,
  ano_fim: new Date().getFullYear() + 1,
};

type QuickCreateSeasonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Loja usa o token de loja direto (POST /lojas/temporadas/); jogador
  // organizador precisa informar em nome de qual loja está criando (POST
  // /lojas/temporadas/organizador, que exige loja_id no corpo) — mesmo
  // padrão de QuickCreateRuleDialog.
  isJogadorOrganizador: boolean;
  // Quando o chamador já sabe a loja (ex.: veio de um torneio específico em
  // TournamentEditDetails), passe lojaId direto. Quando não há uma loja óbvia
  // (ex.: atalho na sidebar), passe `lojas` para exibir um seletor.
  lojaId?: number;
  lojas?: LojaJogadorPublico[];
  tcg: string;
  onCreated: (temporada: TemporadaPublico) => void;
};

export function QuickCreateSeasonDialog({
  open,
  onOpenChange,
  isJogadorOrganizador,
  lojaId,
  lojas,
  tcg,
  onCreated,
}: QuickCreateSeasonDialogProps) {
  const [lojaSelecionadaId, setLojaSelecionadaId] = useState('');
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<TemporadaForm>({
    resolver: zodResolver(temporadaSchema),
    defaultValues: valoresPadrao,
  });

  const lojaIdEfetivo = lojas ? Number(lojaSelecionadaId) || undefined : lojaId;

  const createMutationLoja = useCreateTemporada(tcg);
  const createMutationOrganizador = useCreateTemporadaOrganizador(lojaIdEfetivo, tcg);
  const isPending = isJogadorOrganizador ? createMutationOrganizador.isPending : createMutationLoja.isPending;

  const onSubmit = (data: TemporadaForm) => {
    const handleSuccess = (novaTemporada: TemporadaPublico) => {
      reset(valoresPadrao);
      setLojaSelecionadaId('');
      onOpenChange(false);
      onCreated(novaTemporada);
    };

    if (isJogadorOrganizador) {
      if (!lojaIdEfetivo) return;
      createMutationOrganizador.mutate({ ...data, tcg, loja_id: lojaIdEfetivo }, { onSuccess: handleSuccess });
    } else {
      createMutationLoja.mutate({ ...data, tcg }, { onSuccess: handleSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Temporada</DialogTitle>
          <DialogDescription>
            Defina o período (mês/ano) da temporada para que este torneio passe a ser considerado na categorização de idade (Junior/Senior/Master).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {lojas && (
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Loja</label>
              <Select value={lojaSelecionadaId} onValueChange={setLojaSelecionadaId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma loja" />
                </SelectTrigger>
                <SelectContent>
                  {lojas.map((loja) => (
                    <SelectItem key={loja.loja.id} value={String(loja.loja.id)}>
                      {loja.loja.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm mb-1 text-muted-foreground">Nome (opcional)</label>
            <input
              type="text"
              {...register('nome')}
              placeholder="Ex: 2026-2027"
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Mês de Início</label>
              <Controller
                name="mes_inicio"
                control={control}
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MESES.map((mes) => (
                        <SelectItem key={mes.value} value={String(mes.value)}>{mes.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Ano de Início</label>
              <input
                type="number"
                {...register('ano_inicio', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-border rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Mês de Fim</label>
              <Controller
                name="mes_fim"
                control={control}
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MESES.map((mes) => (
                        <SelectItem key={mes.value} value={String(mes.value)}>{mes.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Ano de Fim</label>
              <input
                type="number"
                {...register('ano_fim', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-border rounded-lg outline-none"
              />
              {errors.mes_fim && <p className="text-destructive text-xs mt-1">{errors.mes_fim.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || (isJogadorOrganizador && !lojaIdEfetivo)}>
              {isPending ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
