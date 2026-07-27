import type { JogadorTorneioLinkPublico, TorneioPublico } from "@/types/Tournaments";
import type { ComposicaoUnidade, RepresentacaoComposicao, Unidade } from "@/types/Composicao";
import { nomeDoFormato } from "@/lib/pokemonFormats";
import { momentoEfetivoTorneio } from "@/lib/dateUtils";
import { jogoTemRepresentacaoDeck } from "@/lib/pokemonModalidade";

const FORMAT_COLORS: Record<string, string> = {
  PADRAO: '#8b5cf6',
  GLC: '#ec4899',
  DRAFT: '#3b82f6',
  Desconhecido: '#94a3b8'
};

export const getMonthlyTournaments = (tournaments: TorneioPublico[]) => {
  const monthMap: Record<string, number> = {};

  tournaments.forEach((t) => {
    const month = momentoEfetivoTorneio(t).toLocaleString('pt-BR', {
      month: 'short',
    }).replace('.', '');

    monthMap[month] = (monthMap[month] ?? 0) + 1;
  });

  return Object.entries(monthMap).map(([month, tournaments]) => ({
    month: month.charAt(0).toUpperCase() + month.slice(1),
    tournaments,
  }));
};

export const getFormatData = (tournaments: TorneioPublico[]) => {
  const formatMap: Record<string, number> = {};

  tournaments.forEach((t) => {
    const formato = t.formato || "Desconhecido";
    formatMap[formato] = (formatMap[formato] ?? 0) + 1;
  });

  return Object.entries(formatMap).map(([id, value]) => ({
    name: nomeDoFormato(id === "Desconhecido" ? null : id) || "Desconhecido",
    value,
    color: FORMAT_COLORS[id] || FORMAT_COLORS.Desconhecido,
  }));
};

export const getRecentTournaments = (tournaments: TorneioPublico[]) => {
  return tournaments
    .filter((t) => t.status === 'FINALIZADO')
    .sort(
      (a, b) =>
        momentoEfetivoTorneio(b).getTime() -
        momentoEfetivoTorneio(a).getTime()
    )
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      nome: t.nome,
      data_planejada: t.data_planejada,
      jogadores: t.jogadores,
      vencedor: t.jogadores?.slice().sort((a, b) => b.pontuacao - a.pontuacao)[0]?.apelido ?? '—',
      status: t.status
    }));
};

export type CrescimentoSemanal = {
  atual: number;
  anterior: number;
  diferenca: number;
};

const somaNaJanela = (
  tournaments: TorneioPublico[],
  inicio: Date,
  fim: Date,
  valor: (t: TorneioPublico) => number,
) =>
  tournaments
    .filter((t) => {
      const momento = momentoEfetivoTorneio(t);
      return momento >= inicio && momento < fim;
    })
    .reduce((acc, t) => acc + valor(t), 0);

/**
 * Compara os últimos 7 dias contra os 7 dias anteriores a esses --
 * "semana atual" e "semana anterior" são só janelas móveis de 7 dias a
 * partir de agora, não semanas de calendário (domingo a sábado).
 */
export const getCrescimentoSemanal = (
  tournaments: TorneioPublico[],
  valor: (t: TorneioPublico) => number = () => 1,
): CrescimentoSemanal => {
  const agora = new Date();
  const inicioSemanaAtual = new Date(agora);
  inicioSemanaAtual.setDate(agora.getDate() - 7);
  const inicioSemanaAnterior = new Date(agora);
  inicioSemanaAnterior.setDate(agora.getDate() - 14);

  const atual = somaNaJanela(tournaments, inicioSemanaAtual, agora, valor);
  const anterior = somaNaJanela(tournaments, inicioSemanaAnterior, inicioSemanaAtual, valor);

  return { atual, anterior, diferenca: atual - anterior };
};

export type DeckDoJogador = {
  chave: string;
  jogo: string;
  nome: string;
  representacao: RepresentacaoComposicao | null;
  composicaoUnidades: ComposicaoUnidade[];
  /** Unidades já normalizadas pra exibição (sprites), venha o deck da
   * representação de arquétipo (TCG) ou da composição exata (VGC/GO). */
  unidadesExibicao: Unidade[];
  vitorias: number;
  derrotas: number;
  empates: number;
  vezesJogado: number;
};

const chaveComposicaoUnidades = (unidades: ComposicaoUnidade[]) =>
  unidades
    .map((u) => `${u.unidade_catalogo_id}:${u.quantidade}`)
    .sort()
    .join(",");

export const nomeComposicaoUnidades = (unidades: ComposicaoUnidade[]) =>
  unidades.map((u) => u.unidade.nome).join(" / ");

type IdentificacaoDeck = {
  chave: string;
  nome: string;
  representacao: RepresentacaoComposicao | null;
  composicaoUnidades: ComposicaoUnidade[];
  unidadesExibicao: Unidade[];
};

/**
 * Identifica a que "deck" um link de jogador/torneio pertence -- no TCG de
 * Pokémon, pela representação de arquétipo (ícone); em VGC/GO, que não tem
 * esse conceito, pela composição exata do time (mesmo conjunto de
 * unidades e quantidades). Retorna null quando o link não tem composição
 * registrada (não dá pra atribuir a nenhum deck).
 */
const identificarDeck = (link: JogadorTorneioLinkPublico, jogo: string): IdentificacaoDeck | null => {
  if (jogoTemRepresentacaoDeck(jogo)) {
    if (!link.composicao_representacao) return null;
    return {
      chave: `rep-${link.composicao_representacao.id}`,
      nome: link.composicao_representacao.nome,
      representacao: link.composicao_representacao,
      composicaoUnidades: [],
      unidadesExibicao: link.composicao_representacao.unidades,
    };
  }

  if (!link.composicao_unidades || link.composicao_unidades.length === 0) return null;
  return {
    chave: chaveComposicaoUnidades(link.composicao_unidades),
    nome: nomeComposicaoUnidades(link.composicao_unidades),
    representacao: null,
    composicaoUnidades: link.composicao_unidades,
    unidadesExibicao: link.composicao_unidades.map((u) => u.unidade),
  };
};

export const getDecksDoJogador = (
  tournaments: TorneioPublico[],
  jogadorId: number,
  jogo: string,
): DeckDoJogador[] => {
  const grupos = new Map<string, DeckDoJogador>();

  tournaments
    .filter((t) => t.jogo === jogo)
    .forEach((t) => {
      const link = t.jogadores?.find((j) => j.jogador_id === jogadorId);
      if (!link) return;

      const identificacao = identificarDeck(link, jogo);
      if (!identificacao) return;

      const deck = grupos.get(identificacao.chave) ??
        { ...identificacao, jogo, vitorias: 0, derrotas: 0, empates: 0, vezesJogado: 0 };
      deck.vitorias += link.vitorias ?? 0;
      deck.derrotas += link.derrotas ?? 0;
      deck.empates += link.empates ?? 0;
      deck.vezesJogado += 1;

      grupos.set(identificacao.chave, deck);
    });

  return Array.from(grupos.values());
};

export type DeckRanking = {
  chave: string;
  jogo: string;
  nome: string;
  representacao: RepresentacaoComposicao | null;
  unidadesExibicao: Unidade[];
  vitorias: number;
  derrotas: number;
  empates: number;
  popularidade: number;
  pontuacaoTotal: number;
};

/**
 * Ranking de decks/equipes agregado entre TODOS os jogadores de um jogo --
 * usado na aba "Decks"/"Equipes" da página de Rankings, espelhando
 * exatamente o mesmo conjunto de torneios já filtrado (busca/formato/loja/
 * período/temporada) que a aba "Jogadores" usa, mais o filtro de categoria
 * (aplicado por link, já que cada jogador pode estar numa categoria
 * diferente dentro do mesmo torneio).
 */
export const getRankingDeDecks = (
  tournaments: TorneioPublico[],
  jogo: string,
  categoriaFiltro: string,
  usarPontuacaoComRegras: boolean,
): DeckRanking[] => {
  const grupos = new Map<string, DeckRanking>();

  for (const torneio of tournaments) {
    if (torneio.jogo !== jogo) continue;

    for (const link of torneio.jogadores ?? []) {
      if (link.tipo === "JUIZ") continue;
      if (categoriaFiltro !== "todos" && link.categoria !== categoriaFiltro) continue;

      const identificacao = identificarDeck(link, jogo);
      if (!identificacao) continue;

      const deck = grupos.get(identificacao.chave) ?? {
        chave: identificacao.chave,
        jogo,
        nome: identificacao.nome,
        representacao: identificacao.representacao,
        unidadesExibicao: identificacao.unidadesExibicao,
        vitorias: 0,
        derrotas: 0,
        empates: 0,
        popularidade: 0,
        pontuacaoTotal: 0,
      };

      deck.vitorias += link.vitorias ?? 0;
      deck.derrotas += link.derrotas ?? 0;
      deck.empates += link.empates ?? 0;
      deck.popularidade += 1;
      deck.pontuacaoTotal += (usarPontuacaoComRegras ? link.pontuacao_com_regras : link.pontuacao) ?? 0;

      grupos.set(identificacao.chave, deck);
    }
  }

  return Array.from(grupos.values()).sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);
};

export const getUpcomingTournaments = (tournaments: TorneioPublico[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tournaments
    .filter(
      (t) =>
        t.status === 'ABERTO' &&
        momentoEfetivoTorneio(t) >= today
    )
    .map((t) => ({
      id: t.id,
      nome: t.nome,
      data_planejada: t.data_planejada,
      jogadores: t.jogadores,
      status: t.status,
    }));
};