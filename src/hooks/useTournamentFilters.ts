import { useMemo, useState } from 'react';
import type { TorneioPublico } from '@/types/Tournaments';

export type DatePreset = 'semana' | 'mes' | 'trimestre' | 'ano' | null;

const inicioSemana = (data: Date) => {
  const d = new Date(data);
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fimSemana = (data: Date) => {
  const fim = inicioSemana(data);
  fim.setDate(fim.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return fim;
};

const inicioMes = (data: Date) => new Date(data.getFullYear(), data.getMonth(), 1);
const fimMes = (data: Date) => new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59, 999);

const inicioTrimestre = (data: Date) => {
  const trimestre = Math.floor(data.getMonth() / 3);
  return new Date(data.getFullYear(), trimestre * 3, 1);
};

const fimTrimestre = (data: Date) => {
  const trimestre = Math.floor(data.getMonth() / 3);
  return new Date(data.getFullYear(), trimestre * 3 + 3, 0, 23, 59, 59, 999);
};

const inicioAno = (data: Date) => new Date(data.getFullYear(), 0, 1);
const fimAno = (data: Date) => new Date(data.getFullYear(), 11, 31, 23, 59, 59, 999);

const presetParaIntervalo = (preset: DatePreset): [Date, Date] | null => {
  const agora = new Date();
  switch (preset) {
    case 'semana': return [inicioSemana(agora), fimSemana(agora)];
    case 'mes': return [inicioMes(agora), fimMes(agora)];
    case 'trimestre': return [inicioTrimestre(agora), fimTrimestre(agora)];
    case 'ano': return [inicioAno(agora), fimAno(agora)];
    default: return null;
  }
};

export const datePresets: { id: DatePreset; label: string }[] = [
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mês' },
  { id: 'trimestre', label: 'Trimestre' },
  { id: 'ano', label: 'Ano' },
];

// Filtros compartilhados entre a página de Torneios e a de Ranking — mesma
// busca/status/formato/loja/período, pra manter a experiência idêntica nas
// duas telas (pedido explícito: "o ranking deve ter os mesmos filtros da
// página de torneios").
export const useTournamentFilters = (torneios: TorneioPublico[] | undefined, isJogador: boolean) => {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [formatoFiltro, setFormatoFiltro] = useState('todos');
  const [lojaFiltro, setLojaFiltro] = useState('todas');
  const [datePreset, setDatePreset] = useState<DatePreset>(null);
  const [dataInicioCustom, setDataInicioCustom] = useState('');
  const [dataFimCustom, setDataFimCustom] = useState('');

  const usaDataCustom = Boolean(dataInicioCustom || dataFimCustom);

  const selecionarPreset = (preset: DatePreset) => {
    setDatePreset((atual) => (atual === preset ? null : preset));
    setDataInicioCustom('');
    setDataFimCustom('');
  };

  const handleDataCustomChange = (campo: 'inicio' | 'fim', valor: string) => {
    setDatePreset(null);
    if (campo === 'inicio') setDataInicioCustom(valor);
    else setDataFimCustom(valor);
  };

  const formatosDisponiveis = useMemo(
    () => Array.from(new Set((torneios ?? []).map((t) => t.formato).filter((f): f is string => Boolean(f)))),
    [torneios],
  );

  const lojasDisponiveis = useMemo(
    () => Array.from(
      new Map(
        (torneios ?? [])
          .filter((t) => t.loja)
          .map((t) => [t.loja!.id, t.loja!])
      ).values()
    ),
    [torneios],
  );

  const torneiosFiltrados = useMemo(() => {
    const intervaloPreset = presetParaIntervalo(datePreset);
    const dataInicioFiltro = dataInicioCustom ? new Date(`${dataInicioCustom}T00:00:00`) : intervaloPreset?.[0];
    const dataFimFiltro = dataFimCustom ? new Date(`${dataFimCustom}T23:59:59`) : intervaloPreset?.[1];

    return (torneios ?? []).filter((torneio) => {
      if (busca.trim() && !torneio.nome?.toLowerCase().includes(busca.trim().toLowerCase())) return false;
      if (statusFiltro !== 'todos' && torneio.status !== statusFiltro) return false;
      if (formatoFiltro !== 'todos' && torneio.formato !== formatoFiltro) return false;
      if (isJogador && lojaFiltro !== 'todas' && String(torneio.loja?.id) !== lojaFiltro) return false;

      if (dataInicioFiltro || dataFimFiltro) {
        const dataTorneio = new Date(torneio.data_planejada);
        if (dataInicioFiltro && dataTorneio < dataInicioFiltro) return false;
        if (dataFimFiltro && dataTorneio > dataFimFiltro) return false;
      }

      return true;
    });
  }, [torneios, busca, statusFiltro, formatoFiltro, lojaFiltro, isJogador, datePreset, dataInicioCustom, dataFimCustom]);

  return {
    busca, setBusca,
    statusFiltro, setStatusFiltro,
    formatoFiltro, setFormatoFiltro,
    lojaFiltro, setLojaFiltro,
    datePreset, usaDataCustom, selecionarPreset,
    dataInicioCustom, dataFimCustom, handleDataCustomChange,
    formatosDisponiveis, lojasDisponiveis,
    torneiosFiltrados,
  };
};
