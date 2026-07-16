import { Plus, Trash2, X, CalendarRange } from 'lucide-react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppCard } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { useOrganizadorDoTenantAtual } from '@/hooks/organizadorTenant.hooks';
import { useTcgSelection } from '@/hooks/tcgSelectionContext.hooks';
import {
  useCreateTemporada,
  useCreateTemporadaOrganizador,
  useDeleteTemporada,
  useDeleteTemporadaOrganizador,
  useTemporadas,
  useTemporadasLoja,
} from '@/hooks/temporadas.hooks';
import { temporadaSchema, MESES, nomeDoMes, type TemporadaForm } from '@/schemas/temporada.schemas';
import { nomeDoJogo } from '@/lib/tcgGames';

const JOGOS_POKEMON = ['POKEMON', 'POKEMON_VGC', 'POKEMON_GO'];

export default function TemporadasPokemon() {
  const user = useAuthenticatedUser();
  const isJogador = user.tipo === 'jogador';

  const { selectedTcg } = useTcgSelection();
  const [isCreating, setIsCreating] = useState(false);

  const ehJogoPokemon = JOGOS_POKEMON.includes(selectedTcg ?? '');

  // BRK-402 "Regra de Ouro": Temporada só pode ser gerenciada dentro do
  // subdomínio da própria loja — a loja fica implícita (tenantLojaId), sem
  // select (BRK-401). Um jogador que organiza várias lojas gerencia cada
  // uma separadamente, entrando no respectivo subdomínio.
  const { tcgs: tcgsOrganizados, lojaId: tenantLojaId } = useOrganizadorDoTenantAtual();
  const organizaEsteTcgAqui = tcgsOrganizados.includes(selectedTcg ?? '');
  const lojaId = isJogador ? (organizaEsteTcgAqui ? tenantLojaId : undefined) : undefined;
  const { isLoading: isMeLoading } = useMe(isJogador);

  const { data: temporadasLoja, isLoading: isLoadingLoja } = useTemporadas(!isJogador && ehJogoPokemon ? selectedTcg : undefined);
  const { data: temporadasOrganizador, isLoading: isLoadingOrganizador } = useTemporadasLoja(
    isJogador && ehJogoPokemon ? lojaId : undefined,
    ehJogoPokemon ? selectedTcg : undefined,
  );
  const temporadas = isJogador ? temporadasOrganizador : temporadasLoja;
  const isLoadingTemporadas = isJogador ? isLoadingOrganizador : isLoadingLoja;

  const createMutationLoja = useCreateTemporada(selectedTcg);
  const createMutationOrganizador = useCreateTemporadaOrganizador(lojaId, selectedTcg);
  const deleteMutationLoja = useDeleteTemporada(selectedTcg);
  const deleteMutationOrganizador = useDeleteTemporadaOrganizador(lojaId, selectedTcg);
  const deleteMutation = isJogador ? deleteMutationOrganizador : deleteMutationLoja;

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<TemporadaForm>({
    resolver: zodResolver(temporadaSchema),
    defaultValues: { nome: '', mes_inicio: 9, ano_inicio: new Date().getFullYear(), mes_fim: 8, ano_fim: new Date().getFullYear() + 1 },
  });

  const handleCancel = () => {
    setIsCreating(false);
    reset();
  };

  const onSubmit = handleSubmit((data) => {
    if (!selectedTcg) return;

    if (isJogador) {
      if (!lojaId) return;
      createMutationOrganizador.mutate({ ...data, tcg: selectedTcg, loja_id: lojaId }, { onSuccess: handleCancel });
    } else {
      createMutationLoja.mutate({ ...data, tcg: selectedTcg }, { onSuccess: handleCancel });
    }
  });

  const isSalvandoCriacao = isJogador ? createMutationOrganizador.isPending : createMutationLoja.isPending;
  const isLoading = (isJogador && isMeLoading) || (Boolean(lojaId || !isJogador) && isLoadingTemporadas);

  if (!ehJogoPokemon) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-foreground">Temporadas</h1>
          <p className="text-muted-foreground">
            Temporadas só existem para os jogos Pokémon (TCG, VGC e GO) — selecione um deles na
            barra de jogos à esquerda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 text-foreground">Temporadas — {nomeDoJogo(selectedTcg)}</h1>
          <p className="text-muted-foreground">
            Defina o período (mês/ano) de cada temporada. A categoria de idade de cada jogador
            (Junior/Senior/Master) é calculada pela idade que ele completa até o último mês da
            temporada em que o torneio aconteceu.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isJogador && !lojaId} className="shrink-0">
          <Plus className="w-5 h-5" />
          <span>Nova Temporada</span>
        </Button>
      </div>

      {isJogador && !lojaId && (
        <p className="mb-6 text-sm text-muted-foreground">
          Você não organiza a loja deste subdomínio em {nomeDoJogo(selectedTcg)} — acesse o
          subdomínio da loja que você organiza pra gerenciar as temporadas dela.
        </p>
      )}

      {isCreating && (
        <div className="bg-card rounded-lg shadow-lg p-6 mb-8 border-2 border-primary">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-foreground font-bold">Nova Temporada</h2>
            <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">Nome (opcional)</label>
              <input
                type="text"
                {...register('nome')}
                placeholder="Ex: 2026-2027"
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Mês de Início</label>
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
                <label className="block text-sm mb-2 text-muted-foreground">Ano de Início</label>
                <input
                  type="number"
                  {...register('ano_inicio', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Mês de Fim</label>
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
                <label className="block text-sm mb-2 text-muted-foreground">Ano de Fim</label>
                <input
                  type="number"
                  {...register('ano_fim', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
                {errors.mes_fim && (
                  <p className="text-destructive text-xs mt-1">{errors.mes_fim.message}</p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-border">
              <Button type="submit" disabled={isSalvandoCriacao}>
                {isSalvandoCriacao ? 'Salvando...' : 'Salvar Temporada'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      {!isLoading && (!isJogador || lojaId) && !temporadas?.length && (
        <AppCard icon={<CalendarRange className="w-5 h-5" />} title="Nenhuma temporada cadastrada">
          <p className="text-sm text-muted-foreground py-4 text-center">
            Cadastre a primeira temporada de {nomeDoJogo(selectedTcg)} clicando em "Nova Temporada".
          </p>
        </AppCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {temporadas?.map((temporada) => (
          <div key={temporada.id} className="bg-card rounded-lg shadow p-6 border-l-4 border-primary">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl text-foreground font-bold">
                  {temporada.nome || `${nomeDoMes(temporada.mes_inicio)}/${temporada.ano_inicio} — ${nomeDoMes(temporada.mes_fim)}/${temporada.ano_fim}`}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {nomeDoMes(temporada.mes_inicio)} de {temporada.ano_inicio} até{' '}
                  {nomeDoMes(temporada.mes_fim)} de {temporada.ano_fim}
                </p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(temporada.id)}
                disabled={deleteMutation.isPending}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
