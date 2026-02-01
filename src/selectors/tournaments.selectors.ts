import type { TorneioPublico } from "@/types/Tournaments";

const FORMAT_COLORS: Record<string, string> = {
  Standard: '#8b5cf6',
  Modern: '#ec4899',
  Commander: '#3b82f6',
  Pioneer: '#10b981',
  Legacy: '#f59e0b',
  Pauper: '#6366f1',
  Desconhecido: '#94a3b8'
};

export const getMonthlyTournaments = (tournaments: TorneioPublico[]) => {
  const monthMap: Record<string, number> = {};

  tournaments.forEach((t) => {
    const month = new Date(t.data_inicio).toLocaleString('pt-BR', {
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

  return Object.entries(formatMap).map(([name, value]) => ({
    name,
    value,
    color: FORMAT_COLORS[name] || FORMAT_COLORS.Desconhecido,
  }));
};

export const getRecentTournaments = (tournaments: TorneioPublico[]) => {
  return tournaments
    .filter((t) => t.status === 'FINALIZADO')
    .sort(
      (a, b) =>
        new Date(b.data_inicio).getTime() -
        new Date(a.data_inicio).getTime()
    )
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      nome: t.nome,
      data_inicio: t.data_inicio,
      jogadores: t.jogadores,
      vencedor: t.jogadores?.sort((a, b) => b.pontuacao - a.pontuacao)[0]?.nome ?? '—',
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
        new Date(t.data_inicio) >= today
    )
    .map((t) => ({
      id: t.id,
      nome: t.nome,
      data_inicio: t.data_inicio,
      jogadores: t.jogadores,
      status: t.status,
    }));
};