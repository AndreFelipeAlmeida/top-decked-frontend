import type { TemporadaPublico } from '@/types/Temporada';
import { parseDataLocal } from './dateUtils';

// Réplica em JS de CategoriaUtil.encontrar_temporada_do_torneio (backend) —
// mesma lógica de conter a data (real, se o torneio já FINALIZADO — ver
// dateUtils.momentoEfetivoTorneio; senão a planejada) num intervalo
// [início, fim] em (ano, mês) de uma Temporada. Usada tanto pro filtro de
// temporada do Ranking quanto pro aviso de "torneio fora de temporada" ao
// salvar um torneio importado (ver docs/TEMPORADAS.md).
export const dataEstaNaTemporada = (data: Date, temporada: TemporadaPublico) => {
  const chave = data.getFullYear() * 12 + data.getMonth();
  const inicio = temporada.ano_inicio * 12 + (temporada.mes_inicio - 1);
  const fim = temporada.ano_fim * 12 + (temporada.mes_fim - 1);
  return chave >= inicio && chave <= fim;
};

export const encontrarTemporadaDaData = (dataISO: string | undefined, temporadas: TemporadaPublico[] | undefined) => {
  if (!dataISO) return undefined;
  const data = parseDataLocal(dataISO);
  return (temporadas ?? []).find((temporada) => dataEstaNaTemporada(data, temporada));
};
