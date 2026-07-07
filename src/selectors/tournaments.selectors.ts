import type { TorneioPublico } from "@/types/Tournaments";
import { nomeDoFormato } from "@/lib/pokemonFormats";

// Chaves em sincronia com o enum `FormatoTorneio` do backend (Pokémon TCG —
// ver docs/DIVIDA_TECNICA.md item 43), não com formatos de Magic.
const FORMAT_COLORS: Record<string, string> = {
  PADRAO: '#8b5cf6',
  GLC: '#ec4899',
  DRAFT: '#3b82f6',
  Desconhecido: '#94a3b8'
};

export const getMonthlyTournaments = (tournaments: TorneioPublico[]) => {
  const monthMap: Record<string, number> = {};

  tournaments.forEach((t) => {
    const month = new Date(t.data_planejada).toLocaleString('pt-BR', {
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
        new Date(b.data_planejada).getTime() -
        new Date(a.data_planejada).getTime()
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

export const getUpcomingTournaments = (tournaments: TorneioPublico[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tournaments
    .filter(
      (t) =>
        t.status === 'ABERTO' &&
        new Date(t.data_planejada) >= today
    )
    .map((t) => ({
      id: t.id,
      nome: t.nome,
      data_planejada: t.data_planejada,
      jogadores: t.jogadores,
      status: t.status,
    }));
};