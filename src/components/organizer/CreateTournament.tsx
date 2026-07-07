import { Save, Calendar, Users, Award, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import axios from 'axios';
import { usePlayerTypes } from '@/hooks/playerTypes.hooks';
import { useCreateStoreTournament, useCreateStoreTournamentForm } from '@/hooks/tournaments.hooks';
import type { CreateStoreTournamentForm } from '@/schemas/tournament.schemas';
import type { ApiErrorDetail } from '@/types/Error';
import { pokemonFormats } from '@/lib/pokemonFormats';
import { formatosMD } from '@/lib/formatoMD';
import { tcgGames } from '@/lib/tcgGames';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CreateTournament() {
  const navigate = useNavigate();

  const { data: regras, isLoading: isLoadingRegras } = usePlayerTypes();

  const mutation = useCreateStoreTournament();

  const { register, control, handleSubmit, watch, formState: { errors } } = useCreateStoreTournamentForm();
  const jogoSelecionado = watch('jogo');
  // Regras de pontuação são específicas de um jogo (TipoJogadorBase.tcg) —
  // só oferece pro organizador as regras que já batem com o jogo escolhido
  // pra esse torneio.
  const regrasDoJogo = regras?.filter((regra) => regra.tcg === jogoSelecionado);

  const onSubmit = (data: CreateStoreTournamentForm) => {
    mutation.mutate(data, {
      onSuccess: (novoTorneio) => {
        alert("Torneio criado com sucesso!");
        navigate(`/loja/torneio/${novoTorneio.id}/editar`);
      },
      onError: (error: unknown) => {
        const detail = axios.isAxiosError<ApiErrorDetail>(error)
          ? error.response?.data?.detail
          : undefined;
        alert(typeof detail === 'string' ? detail : "Erro ao criar torneio");
      },
    });
  };

  return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-foreground font-bold">Criar Novo Torneio</h1>
          <p className="text-muted-foreground">Configure os detalhes e as regras da sua competição</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-card rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-xl text-foreground font-bold">Informações Básicas</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground font-medium">Nome do Torneio</label>
                  <input
                    type="text"
                    {...register('nome')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: Campeonato Padrão Semanal"
                  />
                  {errors.nome && <p className="text-destructive text-sm mt-1">{errors.nome.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground font-medium">Jogo</label>
                    <Controller
                      name="jogo"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tcgGames.filter((game) => !game.disabled).map((game) => (
                              <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.jogo && <p className="text-destructive text-sm mt-1">{errors.jogo.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground font-medium">Formato</label>
                    <Controller
                      name="formato"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {pokemonFormats.map((formato) => (
                              <SelectItem key={formato.id} value={formato.id}>{formato.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground font-medium">Melhor de</label>
                    <Controller
                      name="melhor_de"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {formatosMD.map((formato) => (
                              <SelectItem key={formato.id} value={formato.id}>{formato.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.melhor_de && <p className="text-destructive text-sm mt-1">{errors.melhor_de.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground font-medium">Vagas</label>
                    <input
                      type="number"
                      {...register('vagas', { valueAsNumber: true })}
                      className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground font-medium">Cidade</label>
                    <input
                      type="text"
                      {...register('cidade')}
                      className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground font-medium">Estado (UF)</label>
                    <input
                      type="text"
                      maxLength={2}
                      {...register('estado')}
                      className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                      placeholder="Ex: SP"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Agendamento e Estrutura */}
            <div className="bg-card rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-xl text-foreground font-bold">Agendamento</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground font-medium">Data Planejada</label>
                  <input
                    type="date"
                    {...register('data_planejada')}
                    className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground font-medium">Horário Planejado</label>
                  <input
                    type="time"
                    {...register('hora_planejada')}
                    className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground font-medium">Número de Rodadas</label>
                  <input
                    type="number"
                    {...register('n_rodadas', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground font-medium">Tempo por Rodada (min)</label>
                  <input
                    type="number"
                    {...register('tempo_por_rodada', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Regras e Pontuação */}
            <div className="bg-card rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h2 className="text-lg text-foreground font-bold">Regras de Pontuação</h2>
              </div>
              <Controller
                name="regra_basica_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={isLoadingRegras}
                  >
                    <SelectTrigger className="w-full mb-4">
                      <SelectValue
                        placeholder={isLoadingRegras ? 'Carregando regras...' : 'Selecione um conjunto de regras'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {regrasDoJogo?.map((regra) => (
                        <SelectItem key={regra.id} value={String(regra.id)}>{regra.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.regra_basica_id && <p className="text-destructive text-sm mt-1">{errors.regra_basica_id.message}</p>}
              {!isLoadingRegras && !regrasDoJogo?.length && (
                <p className="text-xs text-warning mb-2">
                  Nenhuma regra cadastrada para este jogo ainda — crie uma em "Regras de Jogos" antes de definir a regra básica.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Estas regras definem quantos pontos um jogador ganha por vitória, empate ou derrota.
              </p>
            </div>

            {/* Inscrição e Prêmios */}
            <div className="bg-card rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg text-foreground font-bold">Inscrição e Prêmios</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground font-medium">Taxa de Inscrição (R$)</label>
                  <input
                    type="number"
                    {...register('taxa', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground font-medium">Premiação</label>
                  <textarea
                    {...register('premio')}
                    className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                    rows={3}
                    placeholder="Descreva a premiação do torneio..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center space-x-2 py-4 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:bg-primary/40"
            >
              <Save className="w-5 h-5" />
              <span>{mutation.isPending ? 'Criando...' : 'Criar Torneio'}</span>
            </button>
          </div>
        </form>
      </div>
  );
}