import { useMemo, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TournamentFiltersBar } from './TournamentFiltersBar';
import { ImportTournamentDialog } from './ImportTournamentDialog';

import { StatusTorneio } from '@/types/Enums';
import type { TorneioPublico } from '@/types/Tournaments';
import type { ApiErrorDetail } from '@/types/Error';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import {
  useTournaments,
  useInscreverJogador,
  useDesinscreverJogador,
  useDeleteTournament,
} from '@/hooks/tournaments.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { useTcgSelection } from '@/hooks/tcgSelectionContext.hooks';
import { useViewMode } from '@/hooks/viewModeContext.hooks';
import { useTournamentFilters } from '@/hooks/useTournamentFilters';
import { nomeDoFormato } from '@/lib/pokemonFormats';
import { nomeDoJogo } from '@/lib/tcgGames';
import { dataExibicaoTorneio } from '@/lib/dateUtils';
import { OrganizerViewSwitch } from '@/components/player/OrganizerViewSwitch';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
  return typeof detail === 'string' ? detail : fallback;
};

export default function Tournaments() {
  const user = useAuthenticatedUser();
  const navigate = useNavigate();

  const isJogador = user.tipo === 'jogador';

  const { selectedTcg } = useTcgSelection();
  const { viewMode } = useViewMode();

  const { data: jogador, isLoading: isMeLoading } = useMe(isJogador)

  // Validação extra desta página: o jogador só é considerado organizador aqui
  // se organizar o TCG atualmente selecionado na barra lateral em alguma loja.
  const isOrganizerOfSelectedTcg =
    jogador?.lojas?.some((loja) =>
      loja.organizacoes?.some((org) => org.tcg === selectedTcg)
    ) ?? false;

  // Lojas onde o jogador organiza especificamente o TCG selecionado agora —
  // usado pelo seletor de loja do ImportTournamentDialog (um jogador pode
  // organizar vários jogos em várias lojas diferentes).
  const lojasOrganizadorasDoTcg =
    jogador?.lojas?.filter((loja) =>
      loja.organizacoes?.some((org) => org.tcg === selectedTcg)
    ) ?? [];

  const canCreateTournament = isJogador
    ? isOrganizerOfSelectedTcg && viewMode === 'organizador'
    : true;

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Loja sempre pode editar os torneios da própria lista (getTournamentsByStore
  // já filtra pela loja); jogador só se organizar o TCG do torneio nessa loja.
  const podeEditarTorneio = (torneio: { loja?: { id: number }; jogo?: string | null }) =>
    !isJogador || (
      jogador?.lojas?.some((loja) =>
        loja.loja_id === torneio.loja?.id &&
        loja.organizacoes?.some((org) => org.tcg === torneio.jogo)
      ) ?? false
    );

  const { data: torneios, isLoading: isTournamentsLoading } = useTournaments(user.tipo)

  // A barra lateral de jogos filtra os torneios exibidos por `selectedTcg`
  // (mesmo padrão já usado em OrganizerRankings.tsx).
  const torneiosDoJogo = useMemo(
    () => (torneios ?? []).filter((t) => t.jogo === selectedTcg),
    [torneios, selectedTcg],
  );

  const {
    busca, setBusca,
    statusFiltro, setStatusFiltro,
    formatoFiltro, setFormatoFiltro,
    lojaFiltro, setLojaFiltro,
    datePreset, usaDataCustom, selecionarPreset,
    dataInicioCustom, dataFimCustom, handleDataCustomChange,
    formatosDisponiveis, lojasDisponiveis,
    torneiosFiltrados,
  } = useTournamentFilters(torneiosDoJogo, isJogador);

  const inscreverMutation = useInscreverJogador();
  const desinscreverMutation = useDesinscreverJogador();
  const deleteMutation = useDeleteTournament();
  const [torneioParaExcluir, setTorneioParaExcluir] = useState<TorneioPublico | null>(null);

  // useMe(isJogador) fica com enabled: false pra lojas — uma query desabilitada
  // nunca sai do status "loading" no React Query v4, então isMeLoading ficaria
  // true pra sempre nesse caso. Só conta o loading de "useMe" quando ele de
  // fato está habilitado (isJogador).
  const isLoading = (isJogador && isMeLoading) || isTournamentsLoading

  const getStatusColor = (status: string) => {
    switch (status) {
      case StatusTorneio.ABERTO:
        return 'bg-success/15 text-success border-success/40';

      case StatusTorneio.EM_ANDAMENTO:
        return 'bg-primary/15 text-primary border-primary/40';

      case StatusTorneio.FINALIZADO:
        return 'bg-info/15 text-info border-info/40';

      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  if (isLoading) return <Spinner />;

  // Organizador (jogador em modo "organizador") só vê o que ele pode editar;
  // loja já recebe só os dela do backend; jogador em modo "jogador" vê tudo.
  const torneiosExibidos = isJogador && viewMode === 'organizador'
    ? torneiosFiltrados.filter(podeEditarTorneio)
    : torneiosFiltrados;

  const mostrarBotoesDeGerenciamento = !isJogador || viewMode === 'organizador';

  const handleInscrever = (torneio: TorneioPublico) => {
    inscreverMutation.mutate(torneio.id, {
      onSuccess: () => toast.success('Inscrição realizada com sucesso!'),
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao se inscrever no torneio.')),
    });
  };

  const handleDesinscrever = (torneio: TorneioPublico) => {
    desinscreverMutation.mutate(torneio.id, {
      onSuccess: () => toast.success('Inscrição cancelada.'),
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao cancelar inscrição.')),
    });
  };

  const handleConfirmarExclusao = () => {
    if (!torneioParaExcluir) return;

    deleteMutation.mutate(torneioParaExcluir.id, {
      onSuccess: () => {
        toast.success('Torneio excluído.');
        setTorneioParaExcluir(null);
      },
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao excluir torneio.')),
    });
  };

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-foreground">
            Torneios
          </h1>

          <p className="text-muted-foreground">
            {!canCreateTournament
              ? `Acompanhe os torneios de ${nomeDoJogo(selectedTcg)} disponíveis e seu progresso`
              : `Gerencie seus eventos e competições de ${nomeDoJogo(selectedTcg)}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <OrganizerViewSwitch visible={isJogador && isOrganizerOfSelectedTcg} />

          {canCreateTournament && (
            <>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Importar Torneio</span>
              </button>

              <Link
                to={isJogador ? "/jogador/criar-torneio" : "/loja/criar-torneio"}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />

                <span>Criar Torneio</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <TournamentFiltersBar
        busca={busca}
        onBuscaChange={setBusca}
        statusFiltro={statusFiltro}
        onStatusChange={setStatusFiltro}
        formatoFiltro={formatoFiltro}
        onFormatoChange={setFormatoFiltro}
        formatosDisponiveis={formatosDisponiveis}
        showLojaFilter={isJogador}
        lojaFiltro={lojaFiltro}
        onLojaChange={setLojaFiltro}
        lojasDisponiveis={lojasDisponiveis}
        datePreset={datePreset}
        onSelecionarPreset={selecionarPreset}
        usaDataCustom={usaDataCustom}
        dataInicioCustom={dataInicioCustom}
        dataFimCustom={dataFimCustom}
        onDataCustomChange={handleDataCustomChange}
      />

      {/* Listagem */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {torneiosExibidos.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-12">
            Nenhum torneio encontrado com os filtros selecionados.
          </p>
        )}

        {torneiosExibidos?.map((torneio) => {
          const jaInscrito = torneio.jogadores?.some((j) => j.jogador_id === jogador?.id) ?? false;
          const inscricaoDisponivel = torneio.status === StatusTorneio.ABERTO;

          return (
          <div
            key={torneio.id}
            className="bg-card rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/30"
          >
            <div
              className={`rounded-t-lg p-4 ${
                torneio.status === StatusTorneio.ABERTO
                  ? 'bg-gradient-to-r from-success/10 to-success/5'
                  : torneio.status === StatusTorneio.EM_ANDAMENTO
                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10'
                    : 'bg-gradient-to-r from-info/10 to-info/5'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-foreground">
                  {torneio.nome}
                </h3>

                <span
                  className={`px-2 py-1 text-xs rounded border font-medium ${getStatusColor(torneio.status)}`}
                >
                  {torneio.status}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {dataExibicaoTorneio(torneio)}
                {torneio.loja?.nome ? ` · ${torneio.loja.nome}` : ''}
              </p>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Formato:
                  </span>

                  <p className="text-foreground font-medium">
                    {nomeDoFormato(torneio.formato)}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">
                    Jogadores:
                  </span>

                  <p className="text-foreground font-medium">
                    {torneio.jogadores?.length || 0}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">
                    Rodadas:
                  </span>

                  <p className="text-foreground font-medium">
                    {torneio.rodada_atual > 0
                      ? `${torneio.rodada_atual} de ${torneio.n_rodadas}`
                      : torneio.n_rodadas}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/loja/torneio/${torneio.id}/visualizar`}
                  className={`flex-1 text-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    mostrarBotoesDeGerenciamento
                      ? 'bg-muted text-muted-foreground hover:bg-accent'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  Visualizar
                </Link>

                {mostrarBotoesDeGerenciamento ? (
                  <>
                    <Link
                      to={`/loja/torneio/${torneio.id}/editar`}
                      className="flex-1 text-center px-4 py-2 rounded-lg font-medium transition-colors bg-primary text-white hover:bg-primary/90"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setTorneioParaExcluir(torneio)}
                      title="Excluir torneio"
                      className="px-3 py-2 rounded-lg font-medium transition-colors bg-destructive/15 text-destructive hover:bg-destructive/25"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : inscricaoDisponivel && (
                  jaInscrito ? (
                    <button
                      type="button"
                      onClick={() => handleDesinscrever(torneio)}
                      disabled={desinscreverMutation.isPending}
                      className="flex-1 text-center px-4 py-2 rounded-lg font-medium transition-colors bg-destructive/15 text-destructive hover:bg-destructive/25 disabled:opacity-50"
                    >
                      Desinscrever-se
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleInscrever(torneio)}
                      disabled={inscreverMutation.isPending}
                      className="flex-1 text-center px-4 py-2 rounded-lg font-medium transition-colors bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      Inscrever-se
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <Dialog open={torneioParaExcluir !== null} onOpenChange={(open) => !open && setTorneioParaExcluir(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir torneio</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o torneio "{torneioParaExcluir?.nome}"? Essa ação apaga
              permanentemente o torneio, suas rodadas, inscrições e composições — não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTorneioParaExcluir(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmarExclusao}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {canCreateTournament && (
        <ImportTournamentDialog
          open={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
          isJogadorOrganizador={isJogador}
          lojas={lojasOrganizadorasDoTcg}
          onImported={(torneioId) => navigate(`/loja/torneio/${torneioId}/editar`)}
        />
      )}
    </div>
  );
}
