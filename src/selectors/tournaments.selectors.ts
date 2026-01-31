import type { Tournament } from "@/types/Tournaments"

const FORMAT_COLORS: Record<Tournament['formato'], string> = {
  Standard: '#8b5cf6',
  Modern: '#ec4899',
  Commander: '#3b82f6',
  Pioneer: '#10b981',
  Legacy: '#f59e0b',
}

export const getMonthlyTournaments = (tournaments: Tournament[]) => {
  const monthMap: Record<string, number> = {}

  tournaments.forEach((t) => {
    const month = new Date(t.data_inicio).toLocaleString('pt-BR', {
      month: 'short',
    })

    monthMap[month] = (monthMap[month] ?? 0) + 1
  })

  return Object.entries(monthMap).map(([month, tournaments]) => ({
    month,
    tournaments,
  }))
}

export const getFormatData = (tournaments: Tournament[]) => {
  const formatMap: Record<Tournament['formato'], number> = {
    Standard: 0,
    Modern: 0,
    Commander: 0,
    Pioneer: 0,
    Legacy: 0,
  }

  tournaments.forEach((t) => {
    formatMap[t.formato]++
  })

  return Object.entries(formatMap).map(([name, value]) => ({
    name,
    value,
    color: FORMAT_COLORS[name as Tournament['formato']],
  }))
}

export const getRecentTournaments = (tournaments: Tournament[]) => {
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
      name: t.nome,
      date: t.data_inicio,
      players: t.jogadores,
      winner: t.jogadores.sort((a, b) => b.pontuacao - a.pontuacao)[0]?.nome ?? '—',
    }))
}

export const getUpcomingTournaments = (tournaments: Tournament[]) => {
  const today = new Date()

  return tournaments
    .filter(
      (t) =>
        t.status === 'ABERTO' &&
        new Date(t.data_inicio) >= today
    )
    .map((t) => ({
      id: t.id,
      name: t.nome,
      date: t.data_inicio,
      players: t.jogadores,
      status: t.status,
    }))
}