import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axios from 'axios';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJogadoresDisponiveis, useCriarPontuacaoExtra } from '@/hooks/pontuacaoExtra.hooks';
import {
  pontuacaoExtraSchema,
  parseNumeroComVirgula,
  MOTIVOS_PONTUACAO_EXTRA,
  type PontuacaoExtraForm as PontuacaoExtraFormValues,
} from '@/schemas/pontuacaoExtra.schemas';
import type { ApiErrorDetail } from '@/types/Error';

const valoresPadrao: Partial<PontuacaoExtraFormValues> = {
  descricao: '',
};

type PontuacaoExtraFormProps = {
  torneioId: string;
  onCriado?: () => void;
};

export function PontuacaoExtraForm({ torneioId, onCriado }: PontuacaoExtraFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    resetField,
    watch,
    formState: { errors },
  } = useForm<PontuacaoExtraFormValues>({
    resolver: zodResolver(pontuacaoExtraSchema),
    defaultValues: valoresPadrao,
  });

  const motivo = watch('motivo');
  const motivoSelecionado = Boolean(motivo);

  const { data: jogadores, isLoading: isLoadingJogadores } = useJogadoresDisponiveis(torneioId, motivo);
  const criarMutation = useCriarPontuacaoExtra(torneioId);

  const semJuizesCadastrados = motivo === 'JUIZ' && !isLoadingJogadores && !jogadores?.length;

  const onSubmit = (data: PontuacaoExtraFormValues) => {
    criarMutation.mutate(
      { ...data, descricao: data.descricao || null },
      {
        onSuccess: () => {
          toast.success('Pontuação extra registrada.');
          reset(valoresPadrao);
          onCriado?.();
        },
        onError: (error) => {
          const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
          toast.error(typeof detail === 'string' ? detail : 'Erro ao registrar pontuação extra.');
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1 text-muted-foreground">Motivo</label>
          <Controller
            name="motivo"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={(value) => {
                  field.onChange(value);
                  resetField('jogador_criado_id');
                  resetField('descricao');
                  resetField('pontos');
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um motivo" />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS_PONTUACAO_EXTRA.map((opcaoMotivo) => (
                    <SelectItem key={opcaoMotivo.value} value={opcaoMotivo.value}>{opcaoMotivo.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.motivo && <p className="text-destructive text-xs mt-1">{errors.motivo.message}</p>}
        </div>

        {motivoSelecionado && !semJuizesCadastrados && (
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">Jogador</label>
            <Controller
              name="jogador_criado_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={(value) => field.onChange(Number(value))}
                  disabled={isLoadingJogadores}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoadingJogadores ? 'Carregando...' : 'Selecione um jogador'} />
                  </SelectTrigger>
                  <SelectContent>
                    {jogadores?.map((jogador) => (
                      <SelectItem key={jogador.id} value={String(jogador.id)}>
                        {jogador.apelido || jogador.game_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.jogador_criado_id && (
              <p className="text-destructive text-xs mt-1">{errors.jogador_criado_id.message}</p>
            )}
            {!isLoadingJogadores && !jogadores?.length && (
              <p className="text-xs text-muted-foreground mt-1">
                Nenhum jogador disponível para este motivo.
              </p>
            )}
          </div>
        )}
      </div>

      {semJuizesCadastrados && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Nenhum juiz cadastrado neste torneio</AlertTitle>
          <AlertDescription>
            Cadastre os juízes na aba principal antes de atribuir pontos extras.
          </AlertDescription>
        </Alert>
      )}

      {motivoSelecionado && !semJuizesCadastrados && (
        <>
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">Descrição (opcional)</label>
            <textarea
              {...register('descricao')}
              rows={2}
              placeholder="Ex: Ajudou a arbitrar as rodadas 2 e 3"
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="w-40">
              <label className="block text-sm mb-1 text-muted-foreground">Pontos</label>
              <input
                type="text"
                inputMode="decimal"
                {...register('pontos', { setValueAs: parseNumeroComVirgula })}
                className="w-full px-3 py-2 border border-border rounded-lg outline-none"
              />
              {errors.pontos && <p className="text-destructive text-xs mt-1">{errors.pontos.message}</p>}
            </div>

            <Button type="submit" disabled={criarMutation.isPending}>
              {criarMutation.isPending ? 'Registrando...' : 'Registrar Pontuação Extra'}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
